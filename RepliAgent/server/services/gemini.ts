import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateRequirements(description: string, apiKey: string): Promise<any> {
    const customAI = new GoogleGenAI({ apiKey });
    
    try {
        const systemPrompt = `You are a requirements analysis expert for web development projects. 
        Analyze the project description and generate a comprehensive, structured project plan.
        Focus on identifying the core functionality, required pages, technical requirements, and styling preferences.
        Be specific about what features are essential vs nice-to-have.
        Consider modern web development best practices and user experience.
        
        Return JSON with this exact structure:
        {
            "projectType": "string - brief description of the project type",
            "pages": ["array of specific page names needed"],
            "features": ["array of detailed feature descriptions"],
            "stylingPreferences": "string - detailed styling and design preferences",
            "backendRequired": boolean,
            "databaseRequired": boolean,
            "authentication": boolean,
            "paymentIntegration": boolean,
            "apis": ["array of external APIs or services needed"],
            "complexity": "low|medium|high",
            "estimatedPages": number
        }`;

        const response = await customAI.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        projectType: { type: "string" },
                        pages: { type: "array", items: { type: "string" } },
                        features: { type: "array", items: { type: "string" } },
                        stylingPreferences: { type: "string" },
                        backendRequired: { type: "boolean" },
                        databaseRequired: { type: "boolean" },
                        authentication: { type: "boolean" },
                        paymentIntegration: { type: "boolean" },
                        apis: { type: "array", items: { type: "string" } },
                        complexity: { type: "string", enum: ["low", "medium", "high"] },
                        estimatedPages: { type: "number" }
                    },
                    required: ["projectType", "pages", "features", "stylingPreferences", "backendRequired", "complexity"]
                }
            },
            contents: `Analyze this project description and create a comprehensive requirements document:\n\n${description}`
        });

        let requirements;
        try {
            requirements = JSON.parse(response.text || "{}");
        } catch (parseError) {
            console.error('Failed to parse requirements response:', parseError);
            requirements = {};
        }
        return requirements;
    } catch (error) {
        throw new Error(`Requirements analysis failed: ${error}`);
    }
}

export async function generateFrontendCode(requirements: any, apiKey: string): Promise<any> {
    const customAI = new GoogleGenAI({ apiKey });
    
    try {
        const systemPrompt = `You are an expert React developer specializing in modern web applications.
        Generate complete, production-ready React components using TypeScript and Tailwind CSS.
        
        Follow these guidelines:
        - Use functional components with React hooks
        - Implement proper TypeScript typing
        - Use Tailwind CSS for all styling
        - Create responsive, mobile-first designs
        - Include proper error handling and loading states
        - Use modern React patterns (Context, custom hooks when needed)
        - Ensure accessibility best practices
        - Create modular, reusable components
        - Include proper form validation where applicable
        - Use semantic HTML elements
        
        Return JSON with this structure:
        {
            "components": {
                "ComponentName.tsx": "complete component code as string"
            },
            "pages": {
                "PageName.tsx": "complete page component code as string"  
            },
            "hooks": {
                "useHookName.ts": "custom hook code as string"
            },
            "types": {
                "types.ts": "TypeScript type definitions"
            },
            "utils": {
                "utilName.ts": "utility functions"
            }
        }`;

        const prompt = `Generate a complete React frontend based on these requirements:
        
        Project Type: ${requirements.projectType}
        Pages Required: ${requirements.pages?.join(', ')}
        Features: ${requirements.features?.join(', ')}
        Styling: ${requirements.stylingPreferences}
        Authentication Required: ${requirements.authentication}
        
        Create all necessary components, pages, and utilities. Ensure the code is production-ready and follows best practices.`;

        const response = await customAI.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json"
            },
            contents: prompt
        });

        let frontendCode;
        try {
            frontendCode = JSON.parse(response.text || "{}");
        } catch (parseError) {
            console.error('Failed to parse frontend code response:', parseError);
            frontendCode = {};
        }
        return frontendCode;
    } catch (error) {
        throw new Error(`Frontend generation failed: ${error}`);
    }
}

export async function generateBackendCode(requirements: any, apiKey: string): Promise<any> {
    const customAI = new GoogleGenAI({ apiKey });
    
    if (!requirements.backendRequired) {
        return null;
    }
    
    try {
        const systemPrompt = `You are an expert Node.js backend developer specializing in Express.js applications.
        Generate complete, production-ready backend code using TypeScript, Express.js, and modern practices.
        
        Follow these guidelines:
        - Use Express.js with TypeScript
        - Implement proper error handling middleware
        - Use Zod for request validation
        - Include proper authentication if required
        - Create RESTful API endpoints
        - Use proper HTTP status codes
        - Include request/response type definitions
        - Implement proper database schemas if needed
        - Add proper security headers and middleware
        - Include proper logging
        - Use environment variables for configuration
        
        Return JSON with this structure:
        {
            "routes": {
                "routeName.ts": "complete route handler code"
            },
            "middleware": {
                "middlewareName.ts": "middleware code"
            },
            "models": {
                "ModelName.ts": "data model definitions"
            },
            "services": {
                "serviceName.ts": "business logic services"
            },
            "utils": {
                "utilName.ts": "utility functions"
            },
            "types": {
                "types.ts": "TypeScript type definitions"
            }
        }`;

        const prompt = `Generate a complete Node.js backend based on these requirements:
        
        Project Type: ${requirements.projectType}
        Features: ${requirements.features?.join(', ')}
        Database Required: ${requirements.databaseRequired}
        Authentication Required: ${requirements.authentication}
        Payment Integration: ${requirements.paymentIntegration}
        External APIs: ${requirements.apis?.join(', ')}
        
        Create all necessary routes, middleware, models, and services. Ensure the code is production-ready.`;

        const response = await customAI.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json"
            },
            contents: prompt
        });

        let backendCode;
        try {
            backendCode = JSON.parse(response.text || "{}");
        } catch (parseError) {
            console.error('Failed to parse backend code response:', parseError);
            backendCode = {};
        }
        return backendCode;
    } catch (error) {
        throw new Error(`Backend generation failed: ${error}`);
    }
}

export async function validateCode(frontendCode: any, backendCode: any, requirements: any, apiKey: string): Promise<any> {
    const customAI = new GoogleGenAI({ apiKey });
    
    try {
        const systemPrompt = `You are a senior code reviewer and quality assurance expert.
        Review the generated frontend and backend code for:
        
        - Syntax errors and TypeScript issues
        - Missing imports or dependencies
        - Security vulnerabilities
        - Performance issues
        - Best practice violations
        - Accessibility issues
        - Code structure and organization
        - Error handling completeness
        - Type safety
        - Component/function naming conventions
        
        Provide specific fixes for any issues found.
        
        Return JSON with this structure:
        {
            "isValid": boolean,
            "errors": ["array of specific error descriptions"],
            "warnings": ["array of warning descriptions"],
            "suggestions": ["array of improvement suggestions"],
            "fixes": {
                "frontend": {
                    "fileName.tsx": "corrected code if fixes needed"
                },
                "backend": {
                    "fileName.ts": "corrected code if fixes needed"
                }
            },
            "missingDependencies": ["array of missing npm packages"],
            "securityIssues": ["array of security concerns"],
            "performanceIssues": ["array of performance problems"]
        }`;

        const prompt = `Review and validate this generated code:
        
        Requirements: ${JSON.stringify(requirements)}
        
        Frontend Code: ${JSON.stringify(frontendCode)}
        
        Backend Code: ${JSON.stringify(backendCode)}
        
        Provide detailed analysis and fixes for any issues found.`;

        const response = await customAI.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json"
            },
            contents: prompt
        });

        let validation;
        try {
            validation = JSON.parse(response.text || "{}");
        } catch (parseError) {
            console.error('Failed to parse validation response:', parseError);
            validation = { isValid: false, errors: ['Failed to parse validation response'], fixes: {}, missingDependencies: [], securityIssues: [], performanceIssues: [] };
        }
        return validation;
    } catch (error) {
        throw new Error(`Code validation failed: ${error}`);
    }
}

export async function generateDeploymentPackage(requirements: any, frontendCode: any, backendCode: any, apiKey: string): Promise<any> {
    const customAI = new GoogleGenAI({ apiKey });
    
    try {
        const systemPrompt = `You are a DevOps expert specializing in web application deployment.
        Generate a complete, deployable project structure with all necessary configuration files.
        
        Include:
        - Complete package.json with all dependencies
        - Proper TypeScript configuration
        - Vite/build configuration
        - Environment variable examples
        - README with setup instructions
        - Docker configuration if beneficial
        - Deployment scripts
        - Proper folder structure
        - Configuration for popular platforms (Vercel, Netlify, Railway)
        
        Return JSON with this structure:
        {
            "structure": {
                "package.json": "complete package.json content",
                "README.md": "comprehensive README with setup instructions",
                "tsconfig.json": "TypeScript configuration",
                "vite.config.ts": "Vite configuration",
                ".env.example": "environment variables template",
                "src/components/ComponentName.tsx": "component code",
                "src/pages/PageName.tsx": "page code",
                "server/routes/routeName.ts": "backend code",
                "public/index.html": "HTML template",
                "tailwind.config.js": "Tailwind configuration",
                ".gitignore": "Git ignore file",
                "vercel.json": "Vercel deployment config",
                "netlify.toml": "Netlify deployment config"
            },
            "deploymentInstructions": "step-by-step deployment guide",
            "environmentVariables": ["list of required environment variables"],
            "dependencies": {
                "frontend": ["array of frontend dependencies"],
                "backend": ["array of backend dependencies"]
            }
        }`;

        const prompt = `Create a complete deployment package for this project:
        
        Requirements: ${JSON.stringify(requirements)}
        Frontend Code: ${JSON.stringify(frontendCode)}
        Backend Code: ${JSON.stringify(backendCode)}
        
        Generate a production-ready, deployable project structure.`;

        const response = await customAI.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json"
            },
            contents: prompt
        });

        let deploymentPackage;
        try {
            deploymentPackage = JSON.parse(response.text || "{}");
        } catch (parseError) {
            console.error('Failed to parse deployment package response:', parseError);
            deploymentPackage = {};
        }
        return deploymentPackage;
    } catch (error) {
        throw new Error(`Deployment packaging failed: ${error}`);
    }
}

export async function testApiKey(apiKey: string): Promise<boolean> {
    try {
        const testAI = new GoogleGenAI({ apiKey });
        const response = await testAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hello, respond with 'API key is valid' if you can see this message."
        });
        
        return Boolean(response.text?.includes("API key is valid") || (response.text && response.text.length > 0));
    } catch (error) {
        return false;
    }
}
