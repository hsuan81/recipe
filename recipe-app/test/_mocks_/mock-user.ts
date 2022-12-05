import { User } from '@prisma/client'

export const mockBotUser: User = {
  id: 'bot',
  email: 'bot@email.com',
  //   favoriteId: 'bot',
  name: 'Bot',
  password:
    '$argon2i$v=19$m=16,t=2,p=1$RFNwaW5GWGJ3N2taRHRBUw$6APaFPBnqz1fveog0tEsZQ', // password:0000
  hashedRt: '',
}

export const mockUsers: User[] = [
  {
    id: 'testuser0',
    email: 'aaa@aaa.com',
    // favoriteId: '0',
    name: 'testuser0',
    password:
      '$argon2i$v=19$m=16,t=2,p=1$aXpoMk5yQjRGSVBoS1JSSA$hiDFC+CRQdjn3GJtgQ6c7w', // password:1234
    hashedRt:
      '83715c4856576297df9f7984f373c08f9bf2933d7bd76963ca1801e244c6b246',
  },
  {
    id: 'testuser1',
    email: 'bbb@bbb.com',
    // favoriteId: '1',
    name: 'testuser1',
    password:
      '$argon2i$v=19$m=16,t=2,p=1$aXpoMk5yQjRGSVBoS1JSSA$/M5BSFZw3P+lMFq9wznl6Q', // password:22345
    hashedRt: '',
  },
  {
    id: 'testuser2',
    email: 'ccc@ccc.com',
    // favoriteId: '2',
    name: 'testuser2',
    password:
      '$argon2i$v=19$m=16,t=2,p=1$RFNwaW5GWGJ3N2taRHRBUw$GuRD/0pdu1g4bxWvcnog/w', // password: 9999
    hashedRt: '',
  },
  //   {
  //     id: 'testuser3',
  //     email: 'ddd@ddd.com',
  //     // favoriteId: '3',
  //     name: 'testuser3',
  //     password: '123',
  //     hashedRt: '',
  //   },
  //   {
  //     id: 'testuser4',
  //     email: 'eee@eee.com',
  //     // favoriteId: '4',
  //     name: 'testuser4',
  //     password: '123',
  //     hashedRt: '',
  //   },
]
