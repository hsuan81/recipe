import { Test, TestingModule } from '@nestjs/testing'
import { readFile } from 'fs/promises'
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

  it('upload one file to s3', async () => {
    // convert image file to blob
    // let fs = require('fs')
    // let image = fs.readFileSync('src/../test/_mocks_/mock_assets/dog.jpg', {
    //   encoding: 'base64',
    // })
    let image = await readFile('src/../test/_mocks_/mock_assets/dog.jpg')
    console.log('test noencoding:', image.buffer)
    // pass the blob and image name into uploadImage method and check the return
    const result = await service.s3_upload('dog.jpg', image)
    expect(result?.$metadata.httpStatusCode).toMatchInlineSnapshot(`200`)
    // const result = ['test']
    // jest.spyOn(service, 's3_upload').mockImplementation()
    // expect(await S3Service.findAll()).toBe(result)
  })

  it('delete one file from s3', async () => {
    // convert image file to blob
    // let fs = require('fs')
    // let image = fs.readFileSync('src/../test/_mocks_/mock_assets/dog.jpg', {
    //   encoding: 'base64',
    // })
    // let image = await readFile('src/../test/_mocks_/mock_assets/dog.jpg')
    // console.log('test noencoding:', image.buffer)
    // pass the blob and image name into uploadImage method and check the return
    const result = await service.s3_delete('dog.jpg')
    expect(result?.$metadata.httpStatusCode).toMatchInlineSnapshot(`204`)
    // const result = ['test']
    // jest.spyOn(service, 's3_upload').mockImplementation()
    // expect(await S3Service.findAll()).toBe(result)
  })
})
