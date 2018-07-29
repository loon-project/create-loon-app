import { Get, Res, Controller } from 'loon';

@Controller()
class ApplicationController {

  @Get('/')
  indexAction(@Res() res) {
    res.send('Hello world')
  }

}
