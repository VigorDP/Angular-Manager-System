const path=require('path')

module.exports={
  helpers:{
    toLowercase:function(name) {
      return name.toLocaleLowerCase();
    }
  },
  page: {
    output: path.join(__dirname,'./src/app/routes'),
    templates: [
      {
        name:'Page-List',
        src:path.join(__dirname,'./src/app/common/templates/pages/list'),
        prompts:[]
      },
      {
        name:'Page-List-Batch-Delete',
        src:path.join(__dirname,'./src/app/common/templates/pages/list-batch'),
        prompts:[]
      },
      {
        name:'Page-List-New',
        src:path.join(__dirname,'./src/app/common/templates/pages/list-new'),
        prompts:[]
      }
    ]
  },
  component: {
    output: path.join(__dirname,'components'),
    templates: [
      {
        name:'ComSample',
        src:path.join(__dirname,'./src/app/common/templates/components/test'),
        prompts:[]
      }
    ]
  }
}
