@echo off
echo Executando migracoes do banco de dados...
echo.

cd /d "%~dp0"

echo Conectando ao MySQL...
mysql -u root -p@wl3n3t053! wfibra < migrations\001_add_missing_fields_and_tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migracoes executadas com sucesso!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERRO ao executar migracoes!
    echo Codigo de erro: %ERRORLEVEL%
    echo ========================================
)

pause
