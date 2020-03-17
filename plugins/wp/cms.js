'use strict'

const config = require('../../config')

const wpcom = require('wpcom')(config.get('WP_TOKEN'))


class CmsModel {
  constructor() {
    this.blog = wpcom.site(config.get('WP_URL'))
    this.baseQuery = {
      status: `publish${eval(config.get('WP_SHOW_DRAFT')) ? ',draft' : ''}`
    }
  }


  async getPost(idOrSlug, parentIdOrSlug = '') {

    return new Promise(async (resolve, reject) => {

      // type any will request both pages and posts
      let query = Object.assign(this.baseQuery, {type: 'any'})

      if (parentIdOrSlug) {
        try {
          let parent = await (await this.blog.post(Object.assign(this.baseQuery, {slug: parentIdOrSlug, id: parentIdOrSlug}))).get()
          query.parent_id = parent.ID
          let posts = (await this.blog.postsList(query)).posts
          let post = posts.find(post => post.slug == slug)
          resolve(post)
        } catch (e) {
          reject(e)
        }

      } else {
        query.id = idOrSlug
        query.slug = idOrSlug
        this.blog.post(query).get((err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      }
    })
  }

  async getListOfPages(query={}) {
    query.type = "page"
    const result = await this.getListOfPostsWithMeta(query)
    return result.posts
  }

  async getListOfPosts(query) {
    const result = await this.getListOfPostsWithMeta(query)
    return result.posts
  }

  async getListOfPostsWithMeta(query) {
    return await this.blog.postsList(Object.assign(this.baseQuery, query))
  }

  async getCategories() {
    return await this.blog.categoriesList()
  }

  async getSiteInfo() {
    return await this.blog.get()
  }

  api() {
    return wpcom.req
  }
}

module.exports.CmsModel = CmsModel
