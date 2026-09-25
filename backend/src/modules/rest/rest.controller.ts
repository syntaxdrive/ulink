import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RestService } from './rest.service';

@ApiTags('Universal REST Shim')
@Controller('rest')
export class RestController {
  constructor(private readonly restService: RestService) {}

  @ApiOperation({ summary: 'Query any table (PostgREST compatible)' })
  @Get(':table')
  async getTable(
    @Param('table') table: string,
    @Query() query: Record<string, any>,
    @Headers('accept') accept?: string,
  ) {
    const data = await this.restService.findMany(table, query);

    // If client requested single object via header or .single()
    if (accept && accept.includes('vnd.pgrst.object')) {
      return data[0] || null;
    }

    return data;
  }

  @ApiOperation({ summary: 'Get single record by ID' })
  @Get(':table/:id')
  getRecord(@Param('table') table: string, @Param('id') id: string) {
    return this.restService.findById(table, id);
  }

  @ApiOperation({ summary: 'Create a record in table' })
  @Post(':table')
  @HttpCode(HttpStatus.CREATED)
  createRecord(@Param('table') table: string, @Body() body: any) {
    return this.restService.create(table, body);
  }

  @ApiOperation({ summary: 'Update a record in table' })
  @Patch(':table/:id')
  updateRecord(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.restService.update(table, id, body);
  }

  @ApiOperation({ summary: 'Delete a record from table' })
  @Delete(':table/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRecord(@Param('table') table: string, @Param('id') id: string) {
    return this.restService.delete(table, id);
  }
}
