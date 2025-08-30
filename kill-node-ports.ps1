# PowerShell script to kill all Node.js processes listening on ports 517x (5170-5179)

Write-Host "Scanning for Node.js processes on ports 5170-5179..." -ForegroundColor Yellow

$portsToCheck = 5170..5179
$processesKilled = 0

foreach ($port in $portsToCheck) {
    try {
        # Get the process using the port
        $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        
        if ($connection) {
            $processId = $connection.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process -and ($process.ProcessName -like "*node*" -or $process.Path -like "*node*")) {
                Write-Host "Found Node.js process on port $port (PID: $processId)" -ForegroundColor Cyan
                
                # Kill the process
                Stop-Process -Id $processId -Force
                Write-Host "Killed process $processId on port $port" -ForegroundColor Green
                $processesKilled++
            }
        }
    }
    catch {
        # Silently continue if port is not in use
    }
}

if ($processesKilled -eq 0) {
    Write-Host "No Node.js processes found on ports 5170-5179" -ForegroundColor Yellow
} else {
    Write-Host "`nSuccessfully killed $processesKilled Node.js process(es)" -ForegroundColor Green
}