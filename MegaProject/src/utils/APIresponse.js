class APIresponse{
    constructor(statusCode,message="Success",data){
        this.data = data;
        super(message);
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}