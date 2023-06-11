import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { TodoItem } from "./entities/todo-item.entity";
import { CreateTodoItemDto } from "./dto/create-todo-item.dto";
import { ERROR_RESPONSE_NO_FIND } from "../../../constants/response-errors.constant";
import { ERROR_TODOITEM_LIST_NOT_FOUND } from "../../../constants/todo-item.constant";
import { TodoItemAttributes } from "../../../configs/entities.config";

@Injectable()
export class TodoItemService {

    constructor(@Inject(TodoItem.name) private todoItemRepository: typeof TodoItem) {}

    async create (userId: number, createTodoItemDto: CreateTodoItemDto) {
        try {
            return await this.todoItemRepository.create({
                ...createTodoItemDto,
                user_id: userId,
            })
        }
        catch (e) {
            throw new HttpException({ message: ERROR_TODOITEM_LIST_NOT_FOUND }, HttpStatus.NOT_FOUND);
        }
    }

    async delete (todoItemId: number) {
        return await this.todoItemRepository.destroy({
            where: {
                id: todoItemId
            },
        })
    }

    async findOne (userId: number, todoItemId: number) {
        return await this.todoItemRepository.findOne({
            where: {
                user_id: userId,
                id: todoItemId
            },
            attributes: TodoItemAttributes,
        })
    }

    async findMany (userId: number) {
        return await this.todoItemRepository.findAll({
            where: {
                user_id: userId
            },
            attributes: TodoItemAttributes,
        })
    }

    async updateStatus (userId: number, todoItemId: number, status: boolean) {
        try {
            const todoItem: TodoItem = await this.todoItemRepository.findOne({
                where: {
                    user_id: userId,
                    id: todoItemId
                },
                attributes: TodoItemAttributes,
            })
            if (todoItem) {
                return await todoItem.update({ status });
            }

            throw { message: ERROR_RESPONSE_NO_FIND };
        }
        catch (e) {
            throw new HttpException(e, HttpStatus.NOT_FOUND);
        }
    }

}