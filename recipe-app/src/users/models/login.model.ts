import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user.model";

@ObjectType()
export class LoginResult {
    @Field(() => User)
    user: User;
    @Field()
    token: string;
}