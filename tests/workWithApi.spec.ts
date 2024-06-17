import { test, expect, request } from '@playwright/test';
import tags from './test-data/tags.json'
import { json } from 'stream/consumers';

test.beforeEach(async ({ page }) => {
  await page.route('https://conduit-api.bondaracademy.com/api/tags',async route =>{
      await route.fulfill({//wypelnienie dopowiedzi
        body: JSON.stringify(tags)//ciało odpowiedzi przekształcony tags w jsin
    })

    })
 
    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText("Sign in").click()
    await page.getByRole('textbox',{name:"Email"}).fill("test123@test.pl")
    await page.getByRole('textbox',{name:"Password"}).fill("Test.12148")
    await page.getByRole('button').click()
})
  test("has title",async({page})=>{
    await page.route('*/**/api/articles*',async route =>{
      const response = await route.fetch()
      const responseBody = await response.json()
      responseBody.articles[0].title ="This is a MOCK test title"
      responseBody.articles[0].description ="This is a MOCK test desctiption"
      
      await route.fulfill({
        body: JSON.stringify(responseBody)
      })

    })

    await page.getByText('Global Feed').click()
    await expect(page.locator(".navbar-brand")).toHaveText('conduit')
    await expect(page.locator('app-article-list h1').first()).toContainText("This is a MOCK test title")
    await expect(page.locator('app-article-list p').first()).toContainText("This is a MOCK test desctiption")

});

test('create article with API and delete article',async({page,request})=>{
  const responce =await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
    data:{
      "user": {"email": "test123@test.pl", "password": "Test.12148"}
    }
  })
  const responseBody = await responce.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/",{
    data:{
      "article": {"title": "Test title", "description": "Test description", "body": "Test body", "tagList": []}
    },
    headers:{
      Authorization:`Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201)
  await page.getByText('Global Feed').click()
  await page.getByText('Test title').click()
  await page.getByRole('button',{name:"Delete Article"}).first().click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).not.toContainText("Test title")
} )
test("create article and delete with API",async({page,request})=>{
  await page.getByText('New Article').click()
  await page.getByRole('textbox',{name:'Article Title'}).fill("Test 2 tittle")
  await page.getByRole('textbox',{name:"What's this article about?"}).fill("Test 2 description")
  await page.getByRole('textbox',{name:"Write your article (in markdown)"}).fill("Test 2 body")
  await page.getByRole('button',{name:"Publish Article"}).click()
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('.article-page h1')).toContainText("Test 2 tittle")
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).not.toContainText("Test 2 description")

  const responce =await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
    data:{
      "user": {"email": "test123@test.pl", "password": "Test.12148"}
    }
  })
  const responseBody = await responce.json()
  const accessToken = responseBody.user.token
  const deleteArticle = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`,{
    headers:{
      Authorization:`Token ${accessToken}`
    }
  })
  expect(deleteArticle.status()).toEqual(204)


})

