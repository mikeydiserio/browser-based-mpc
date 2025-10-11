# Static Assets Directory

This directory contains static assets that are served directly without processing.

## Purpose

The `static/` directory is typically used for:

- Static images and icons
- Documentation files
- Configuration files
- Other assets that don't need build processing

## Current Status

This directory is currently empty but serves as a placeholder for future static assets that may be needed for the Browser-Based MPC application.

## Usage

Files placed in this directory can be referenced directly in the application without going through the build process. This is useful for:

- **Images**: Logos, icons, or other static graphics
- **Documents**: PDFs, text files, or other documentation
- **Config**: Static configuration files
- **Assets**: Any other files that should be served as-is

## Integration

To reference files in this directory from the application, use the `/static/` path prefix in your code or HTML.

## Best Practices

- Keep file sizes reasonable for web delivery
- Use appropriate file formats for web compatibility
- Consider compression for large files
- Organize files in logical subdirectories as the project grows
