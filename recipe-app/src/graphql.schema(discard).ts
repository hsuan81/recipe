
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class IngredientNumInput {
    ingredientId?: Nullable<string>;
    recipeId?: Nullable<string>;
    name: string;
    unit: string;
    value: string;
}

export class RecipeInput {
    title: string;
    ingredients: IngredientNumInput[];
    instructions: string[];
}

export class UserInput {
    email: string;
    name?: Nullable<string>;
    password: string;
}

export abstract class IQuery {
    abstract hello(): string | Promise<string>;

    abstract test(): string | Promise<string>;

    abstract latestRecipes(): Recipe[] | Promise<Recipe[]>;

    abstract recipeById(recipeId: string): Recipe | Promise<Recipe>;

    abstract login(email: string, password: string): User | Promise<User>;

    abstract logout(): User | Promise<User>;

    abstract me(): User | Promise<User>;

    abstract findUserById(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract findUserByEmail(email: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract createUser(input: UserInput): User | Promise<User>;

    abstract createRecipe(content: RecipeInput): Recipe | Promise<Recipe>;

    abstract updateRecipe(id: string, content: RecipeInput): Recipe | Promise<Recipe>;

    abstract deleteRecipe(id: string): Recipe | Promise<Recipe>;
}

export class IngredientNum {
    ingredientId: string;
    recipeId: string;
    name: string;
    unit: string;
    value: string;
}

export class Recipe {
    id: string;
    authorId: string;
    title: string;
    ingredients: IngredientNum[];
    instructions: string[];
    updatedAt?: Nullable<Date>;
}

export class User {
    id: string;
    email: string;
    name?: Nullable<string>;
}

export type JSON = any;
type Nullable<T> = T | null;
