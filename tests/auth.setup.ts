import {test as setup} from '@playwright/test';
import fs from 'fs';
import user  from '../.auth/user.json'


const authFile = '.auth/user.json'

setup('authentication',async({request})=>{
   
    const responce =await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
        data:{
          "user": {"email": "test123@test.pl", "password": "Test.12148"}
        }
      })
      const responseBody = await responce.json()
      const accessToken = responseBody.user.token
      user.origins[0].localStorage[0].value =accessToken
      fs.writeFileSync(authFile, JSON.stringify(user))

      process.env['ACCESS_TOKEN'] =  accessToken    
      
})