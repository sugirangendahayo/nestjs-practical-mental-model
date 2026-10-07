import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { BooksService } from "./books.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { QueryBooksDto } from "./dto/query-books.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number): void {
    this.booksService.remove(id);
  }
}
