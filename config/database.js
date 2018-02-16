module.exports = {
    db: {
        "MONGODB_HOST": "mongodb://localhost/maverick",
        "MONGODB_DB": "maverick",
        "MONGODB_SESSION": "sessions",
        "QUERY_LIMIT": 1000,
    }
};

/**
 * Create API DB user:
 *  	db.createUser({user:"dbUser", pwd:"maverick{$123#", roles:["readWrite"]}); 
 **/