import { CollectorResult } from '../types';

/**
 * Generate WebGL fingerprint based on GPU capabilities
 */
export function collectWebGLFingerprint(): CollectorResult<string> {
  const startTime = performance.now();
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return {
        data: 'webgl-unavailable',
        success: false,
        error: 'WebGL context unavailable',
        collectionTime: performance.now() - startTime
      };
    }
    
    // Get basic WebGL parameters
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    
    // Get additional WebGL capabilities
    const version = gl.getParameter(gl.VERSION);
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    const maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    
    // Get supported extensions
    const extensions = gl.getSupportedExtensions() || [];
    
    const fingerprint = [
      `vendor:${vendor}`,
      `renderer:${renderer}`,
      `version:${version}`,
      `shading:${shadingLanguageVersion}`,
      `maxTexture:${maxTextureSize}`,
      `maxVertexAttribs:${maxVertexAttribs}`,
      `maxVertexUniforms:${maxVertexUniformVectors}`,
      `maxFragmentUniforms:${maxFragmentUniformVectors}`,
      `maxVarying:${maxVaryingVectors}`,
      `extensions:${extensions.sort().join(',')}`
    ].join('|');
    
    return {
      data: fingerprint,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: 'webgl-error',
      success: false,
      error: error instanceof Error ? error.message : 'WebGL fingerprinting failed',
      collectionTime: performance.now() - startTime
    };
  }
}

/**
 * Generate WebGL2 fingerprint if available
 */
export function collectWebGL2Fingerprint(): CollectorResult<string> {
  const startTime = performance.now();
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    
    if (!gl) {
      return {
        data: 'webgl2-unavailable',
        success: false,
        error: 'WebGL2 context unavailable',
        collectionTime: performance.now() - startTime
      };
    }
    
    // Get WebGL2 specific parameters
    const version = gl.getParameter(gl.VERSION);
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const max3DTextureSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);
    const maxArrayTextureLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
    const maxColorAttachments = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);
    const maxSamples = gl.getParameter(gl.MAX_SAMPLES);
    
    const fingerprint = [
      `version:${version}`,
      `maxTexture:${maxTextureSize}`,
      `max3DTexture:${max3DTextureSize}`,
      `maxArrayLayers:${maxArrayTextureLayers}`,
      `maxColorAttachments:${maxColorAttachments}`,
      `maxSamples:${maxSamples}`
    ].join('|');
    
    return {
      data: fingerprint,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: 'webgl2-error',
      success: false,
      error: error instanceof Error ? error.message : 'WebGL2 fingerprinting failed',
      collectionTime: performance.now() - startTime
    };
  }
}