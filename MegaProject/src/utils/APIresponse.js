class APIresponse{
    constructor(statusCode,message="Success",data){
        this.statusCode = statusCode;
        this.data = data;
        super(message);
        this.success = statusCode < 400;
    }
}

export {APIresponse}