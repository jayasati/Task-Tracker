/**
 * Task Router - Re-export from modular structure
 * 
 * DEPRECATED: This file now re-exports from the modular task/ folder.
 * The router has been split into:
 * - task/schemas.ts - Zod validation schemas
 * - task/queries.ts - Read operations
 * - task/mutations.ts - CRUD operations
 * - task/statusProcedures.ts - Status/progress updates
 * - task/timerProcedures.ts - Timer management
 * - task/selectionProcedures.ts - Multi-select operations
 * - task/index.ts - Main router combining all procedures
 */
export { taskRouter } from "./task/index";

