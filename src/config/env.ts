const required=(key:string): string =>{
    const value=process.env[key];
    if(!value){
        throw new Error(`Environment variable not found: ${key}`);
    }
    return value;
};

export const env={

    //server
    PORT:process.env.PORT || '3000',
    NODE_ENV:process.env.NODE_ENV || 'development',

    //database
    DATABASE_URL:required('DATABASE_URL'),

    API_KEY:required('API_KEY'),

    MPESSA_API_KEY:required('MPESSA_API_KEY'),
    MPESA_PUBLIC_KEY:required('MPESA_PUBLIC_KEY'),
    MPESA_BASE_URL:required('MPESA_BASE_URL'),
    MPESA_SERVICE_PROVIDER_CODE:required('MPESA_SERVICE_PROVIDER_CODE'),
}