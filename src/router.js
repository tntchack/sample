// modules
import Router from '@koa/router'
import config from './setup/config'
import R from 'ramda'

const PG_UNIQUE_VIOLATION = '23505'

const knex = require('knex')({
  client: 'pg',
  connection: config.postgres,
})

const dbStatusTest = knex('comment').select('*')
dbStatusTest.then(
  () => console.log(" ✔️  database connection ok"),
).catch(console.log)

const router = new Router()

router.post('/comment/report', async ctx => {
  try {
    const result = await knex('reported_comment')
      .insert(ctx.request.body)
      .returning(['id', 'comment', 'reporterId', 'extraDescription', 'reason'])

    ctx.body = result[0]
  } catch (error) {
    if (error.code === PG_UNIQUE_VIOLATION){
      ctx.status = 204
    } else {
      throw e
    }
    ctx.body = error.message
  }

})

router.get('/comment/count', async ctx => {
  const { context, wisId } = ctx.request.query
  const result = await knex('comment')
    .count('*')
    .where({
      context,
      wisId,
      deleted: false
    })

  ctx.body = result[0]
})

router.post('/comment', async ctx => {
  ctx.body = await knex('comment')
    .insert(ctx.request.body)
    .returning(['id', 'wisId', 'context', 'body', 'writerId'])
})

router.put('/comment', async ctx => {
  const { id } = ctx.request.query
  ctx.body = await knex('comment')
    .where({ id })
    .update(ctx.request.body)
    .returning(['id', 'wisId', 'context', 'body', 'writerId'])
})

router.get('/comment', async ctx => {
  const { offset, limit, wisId, context, reactorId } = ctx.request.query
  const deleted = false

  if (limit > 1000 || typeof (limit) === 'undefined') {
    ctx.body = { "result": "limit must be lower than 1000 " }
    ctx.status = 400
  } else {
    const comments = await knex('comment')
      .select('id', 'wisId', 'context', 'body', 'writerId')
      .where({ wisId, context, deleted })
      .limit(parseInt(limit))
      .offset(parseInt(offset))


    // console.log(comments)
    const commentsIds = comments.map(item => {
      return item['id']
    })

    const reactions = await knex('reaction')
      .whereIn('comment', commentsIds)
      .select('body', 'comment')
      .count('body')
      .groupBy('comment', 'body')



    const userReactions = await knex('reaction')
      .select('comment', 'body')
      .whereIn('comment', commentsIds)
      .andWhere({ reactorId })

    const reactionsByComment = R.groupBy(R.prop('comment'), reactions)
    const userReactionsByComment = R.groupBy(R.prop('comment'), userReactions)

    const result = comments.map(item =>
      R.pipe(
        R.assoc('userReactions'
          , R.uniq(
            R.pluck('body',
              R.defaultTo([], userReactionsByComment[item.id])
            )
          )
        ),
        R.assoc('reactions'
          , R.defaultTo([], reactionsByComment[item.id])
            .map(R.dissoc('comment'))
        )
      )(item)
    )

    ctx.body = result
  }
})

router.get('/reaction/count', async ctx => {
  const { comment } = ctx.request.query
  const result = await knex('reaction')
    .where({ comment })
    .select('body')
    .count('body')
    .groupBy('body')

  let new_result = new Object
  result.map(item => {
    return new_result[item['body']] = item['count']
  })

  ctx.body = new_result
})


router.post('/reaction', async ctx => {
  try {
    await knex('reaction')
      .insert(ctx.request.body)
    ctx.status = 200
  } catch (error) {
    if (error.code === PG_UNIQUE_VIOLATION) {
      ctx.status = 204
    } else {
      throw error
    }
  }
})

router.get('/reaction', async ctx => {
  const { reactorId, comment } = ctx.request.query
  const result = await knex('reaction')
    .select('body')
    .where({
      reactorId,
      comment,
    })

  let new_result = result.map(item => {
    return item['body']
  })
  ctx.body = new_result
})

router.del('/reaction', async ctx => {
  const { reactorId, comment, body } = ctx.request.query
  const result = await knex('reaction')
    .where({ reactorId, comment, body })
    .del()

  ctx.status = (result ? 204 : 404)
})

export default router
