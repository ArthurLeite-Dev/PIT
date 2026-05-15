import { ZodError } from 'zod';
/**
 * Middleware de validação usando Zod.
 * Valida req.body, req.params ou req.query conforme especificado.
 */
export function validate(schema) {
    return (req, res, next) => {
        try {
            // Tenta validar req.body (post/put/patch)
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                req.body = schema.parse(req.body);
            }
            // Tenta validar req.params (rotas com :id)
            else if (req.params && Object.keys(req.params).length > 0) {
                req.params = schema.parse(req.params);
            }
            // Tenta validar req.query
            else {
                req.query = schema.parse(req.query);
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'validation_error',
                    message: 'Dados inválidos',
                    details: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            return res.status(500).json({
                error: 'internal_error',
                message: 'Erro ao validar dados',
            });
        }
    };
}
/**
 * Middleware de validação específico para body
 */
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'validation_error',
                    message: 'Dados do corpo da requisição inválidos',
                    details: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            return res.status(500).json({
                error: 'internal_error',
                message: 'Erro ao validar corpo da requisição',
            });
        }
    };
}
/**
 * Middleware de validação específico para params
 */
export function validateParams(schema) {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'validation_error',
                    message: 'Parâmetros da URL inválidos',
                    details: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            return res.status(500).json({
                error: 'internal_error',
                message: 'Erro ao validar parâmetros',
            });
        }
    };
}
