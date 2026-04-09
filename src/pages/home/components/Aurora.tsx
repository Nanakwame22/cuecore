
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

import './Aurora.css';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  // 创建噪声效果
  float noise1 = snoise(vec2(uv.x * 3.0 + uTime * 0.2, uv.y * 2.0 + uTime * 0.1));
  float noise2 = snoise(vec2(uv.x * 2.0 - uTime * 0.15, uv.y * 3.0 + uTime * 0.25));
  
  // 组合噪声
  float combinedNoise = (noise1 + noise2) * 0.5;
  
  // 基于噪声和位置创建颜色混合因子
  float colorFactor = (combinedNoise + 1.0) * 0.5; // 归一化到 0-1
  colorFactor = mix(uv.x, colorFactor, 0.7); // 结合水平位置
  
  // 在三个颜色之间插值
  vec3 finalColor;
  if (colorFactor < 0.5) {
    // 在第一个和第二个颜色之间插值
    float t = colorFactor * 2.0;
    finalColor = mix(uColorStops[0], uColorStops[1], t);
  } else {
    // 在第二个和第三个颜色之间插值
    float t = (colorFactor - 0.5) * 2.0;
    finalColor = mix(uColorStops[1], uColorStops[2], t);
  }
  
  // 创建极光形状
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * uAmplitude;
  height = exp(height * 0.5);
  
  // 计算强度
  float intensity = 1.0 - abs(uv.y - 0.5 - height * 0.3);
  intensity = pow(max(intensity, 0.0), 2.0);
  
  // 应用混合参数
  float alpha = intensity * uBlend;
  
  // 增强颜色饱和度
  finalColor = finalColor * (1.0 + intensity * 0.5);
  
  fragColor = vec4(finalColor * alpha, alpha);
}
`;

export default function Aurora(props: any) {
  const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5, speed = 1.0 } = props;
  const propsRef = useRef(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    (gl.canvas as HTMLCanvasElement).style.backgroundColor = 'transparent';

    let program: Program;

    function resize() {
      if (!ctn) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.uResolution.value = [width, height];
      }
    }
    window.addEventListener('resize', resize);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    // 转换颜色为RGB数组
    const colorStopsArray = colorStops.map((hex: string) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      const currentTime = t * 0.001; // 转换为秒
      
      // 更新uniform值
      program.uniforms.uTime.value = currentTime * (propsRef.current.speed ?? speed);
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? amplitude;
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
      
      // 更新颜色
      const currentColorStops = propsRef.current.colorStops ?? colorStops;
      program.uniforms.uColorStops.value = currentColorStops.map((hex: string) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });
      
      renderer.render({ scene: mesh });
    };
    animateId = requestAnimationFrame(update);

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={ctnDom} className="aurora-container" />;
}
