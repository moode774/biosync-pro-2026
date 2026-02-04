import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Backend Server Manager
 * 
 * ⚠️ SAFETY: This only starts the READ-ONLY backend proxy.
 * The backend itself has NO capability to modify device data.
 */

export class BackendManager {
    private static backendProcess: any = null;
    private static isRunning = false;

    /**
     * Check if backend is running
     */
    static async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:5000/api/health', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Start backend server automatically
     */
    static async startBackend(): Promise<{ success: boolean; message: string }> {
        try {
            console.log('🚀 Starting backend server...');

            // Check if already running
            const isHealthy = await this.checkHealth();
            if (isHealthy) {
                return {
                    success: true,
                    message: 'Backend is already running'
                };
            }

            // Start the backend using the batch file
            const projectRoot = process.cwd();
            const batchFile = path.join(projectRoot, 'start-backend.bat');

            // Execute in a new window so it doesn't block
            if (process.platform === 'win32') {
                exec(`start "" "${batchFile}"`, (error) => {
                    if (error) {
                        console.error('Error starting backend:', error);
                    }
                });
            } else {
                // For macOS/Linux
                exec(`cd backend && pip install -r requirements.txt && python proxy_server.py &`, (error) => {
                    if (error) {
                        console.error('Error starting backend:', error);
                    }
                });
            }

            // Wait a bit for server to start
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verify it started
            const isNowHealthy = await this.checkHealth();

            if (isNowHealthy) {
                this.isRunning = true;
                return {
                    success: true,
                    message: 'Backend started successfully!'
                };
            } else {
                return {
                    success: false,
                    message: 'Backend started but health check failed. Please check the terminal.'
                };
            }

        } catch (error) {
            console.error('Failed to start backend:', error);
            return {
                success: false,
                message: `Failed to start backend: ${error}`
            };
        }
    }

    /**
     * Get backend status
     */
    static async getStatus(): Promise<'running' | 'stopped' | 'unknown'> {
        const isHealthy = await this.checkHealth();
        return isHealthy ? 'running' : 'stopped';
    }
}
