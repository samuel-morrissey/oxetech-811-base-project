import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ticket API",
            version: "1.0.0",
        },
    },
    apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);