import { Test, TestingModule } from '@nestjs/testing'
// import * as fs from 'fs'
import { S3Service } from './s3.service'
import { AppConfigService } from 'src/appconfig/appconfig.service'

describe('S3Service', () => {
  let service: S3Service
  let config: AppConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile()

    service = module.get<S3Service>(S3Service)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('upload image to s3', async () => {
    // convert image file to blob
    let fs = require('fs')
    let image = fs.readFileSync('src/../test/_mocks_/mock_assets/dog.jpg', {
      encoding: 'base64',
    })
    // pass the blob and image name into uploadImage method and check the return
    const result = await service.uploadImage('dog.jpg', image)
    expect(result).toMatchInlineSnapshot(`
      Object {
        "imageName": "dog.jpg",
        "url": "https://\${this.AWS_S3_BUCKET}.s3.amazonaws.com/\${imageName}",
      }
    `)
    // const result = ['test']
    // jest.spyOn(service, 's3_upload').mockImplementation()
    // expect(await S3Service.findAll()).toBe(result)
  })
})
