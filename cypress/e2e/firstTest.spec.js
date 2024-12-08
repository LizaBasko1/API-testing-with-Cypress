describe('Test API', () => {

  beforeEach('Login in Application', () => {
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/tags', {fixture: 'tags.json'}).as('getTags')
    cy.loginToApplication()
  })

  it.only('Verify request for creating new article', () => {

      cy.intercept('POST', Cypress.env("apiUrl") + '/api/articles/').as('postArticles')

      cy.contains('New Article').click()
      cy.get('[formcontrolname="title"]').type("Liza's article")
      cy.get('[formcontrolname="description"]').type('This is description of my article')
      cy.get('[formcontrolname="body"]').type('Test test test test test')
      cy.get('[placeholder="Enter tags"]').type('test')
      cy.get('[type="button"]').click()

      cy.wait('@postArticles').then( xhr => {
        cy.log(xhr)
        expect(xhr.response.statusCode).to.be.equal(201)
        expect(xhr.request.body.article.body).to.be.equal('Test test test test test')
        expect(xhr.request.body.article.title).to.be.equal("Liza's article")
        expect(xhr.request.body.article.description).to.be.equal("This is description of my article")

        expect(xhr.response.body.article.body).to.be.equal('Test test test test test')
        expect(xhr.response.body.article.title).to.be.equal("Liza's article")
        expect(xhr.response.body.article.description).to.be.equal("This is description of my article")
      })

      cy.get('.article-actions button.btn-outline-danger').click()
  })

  it.only('Verify request for creating new article with changing request and response', {retries: 2}, () => {

    cy.intercept('POST', Cypress.env("apiUrl") + '/api/articles/', req => {
      req.body.article.description = "This is description 2"
    }).as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type("Liza's article")
    cy.get('[formcontrolname="description"]').type('This is description of my article')
    cy.get('[formcontrolname="body"]').type('Test test test test test')
    cy.get('[placeholder="Enter tags"]').type('test')
    cy.get('[type="button"]').click()

    cy.wait('@postArticles').then( xhr => {
      cy.log(xhr)
      expect(xhr.response.statusCode).to.be.equal(201)
      expect(xhr.request.body.article.body).to.be.equal('Test test test test test')
      expect(xhr.request.body.article.title).to.be.equal("Liza's article")
      expect(xhr.request.body.article.description).to.be.equal("This is description 2")

      expect(xhr.response.body.article.body).to.be.equal('Test test test test test')
      expect(xhr.response.body.article.title).to.be.equal("Liza's article")
      expect(xhr.response.body.article.description).to.be.equal("This is description 2")
    })

    cy.get('.article-actions button.btn-outline-danger').click()
})

  it('Verify popular tags are displayed', () => {
      cy.get('.tag-list')
      .should('contain', 'Cypress')
      .and('contain', 'Automation')
      .and('contain', 'Testing')
  })

  it('Verify likes counter on article', () => {
    cy.intercept('GET', Cypress.env("apiUrl") + '/api/articles*', {fixture: 'articles.json'}).as('getGlobalArticles')

    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('0'),
      expect(heartList[1]).to.contain('164')
    })


    // y.intercept('POST', 'https://conduit-api.bondaracademy.com/api//*//favorite').as('postFavoriteMark')
    // cy.fixture('articles.json').then(file => {
    //   const articleLink = file.articles[1].slug
    //   cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/The-value-of-pre-recorded-video-classes.-The-most-efficient-approach-to-tranfer-the-knowledge-1/favorite')
    //   .as('postFavoriteMark')
    // })

    cy.get('app-article-list button').eq(1).click()
    cy.get('app-article-list button').should('contain', '165')
  })

  it('Delete new article', () => {

    const articleRequestBody = {
      "article": {
          "title": "Test Article API",
          "description": "here is description",
          "body": "cypress working",
          "tagList": [
              "test"
          ]
      }
  }

    cy.get('@token').then(token => {

      cy.request({
        url: Cypress.env("apiUrl") + '/api/articles/',
        headers: {'Authorization': 'Token '+ token},
        method: 'POST',
        body: articleRequestBody
      }).then( response => {
        expect(response.status).to.equal(201)
      })

      cy.wait(5000)
      cy.get('.article-preview').eq(0).click()
      cy.get('.article-actions button.btn-outline-danger').click()

      cy.request({
        url: Cypress.env("apiUrl") + "/api/articles?limit=10&offset=0",
        headers: {'Authorization': 'Token '+ token},
        method: 'GET'
      }).its('body').then(body => {
        expect(body.articles[0].title).not.to.equal("Test Article API")
      })
    })
  })
})