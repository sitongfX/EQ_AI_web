'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Firework {
  x: number;
  y: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
  }>;
}

interface Heart {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  opacity: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export default function BirthdayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const fireworksRef = useRef<Firework[]>([]);
  const heartsRef = useRef<Heart[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 雪花效果
    const snowflakes: Array<{ x: number; y: number; radius: number; speed: number; opacity: number; rotation: number }> = [];
    for (let i = 0; i < 100; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    // 星星粒子
    const stars: Array<{ x: number; y: number; size: number; twinkle: number; trail: Array<{ x: number; y: number; opacity: number }> }> = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        twinkle: Math.random(),
        trail: [],
      });
    }

    // 光点粒子
    const lightParticles: Array<{ x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; color: string }> = [];
    for (let i = 0; i < 50; i++) {
      lightParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        life: Math.random(),
        maxLife: 1,
        color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff00ff'][Math.floor(Math.random() * 5)],
      });
    }

    // 初始化心形
    for (let i = 0; i < 20; i++) {
      heartsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 15 + 10,
        speed: Math.random() * 1 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // 初始化流星
    for (let i = 0; i < 5; i++) {
      meteorsRef.current.push({
        x: Math.random() * canvas.width,
        y: -50,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // 绘制心形
    function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, size / 4);
      ctx.bezierCurveTo(-size / 2, -size / 4, -size, size / 4, 0, size);
      ctx.bezierCurveTo(size, size / 4, size / 2, -size / 4, 0, size / 4);
      ctx.closePath();
      ctx.restore();
    }

    function createFirework(x: number, y: number) {
      const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffd700', '#ff00ff', '#00ffff', '#ff9ff3'];
      const particles: Firework['particles'] = [];
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 5 + 2;
        particles.push({
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          maxLife: 1,
        });
      }
      
      fireworksRef.current.push({ x, y, particles });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制星星和轨迹
      stars.forEach((star) => {
        star.twinkle += 0.02;
        const opacity = (Math.sin(star.twinkle) + 1) / 2;
        
        // 添加轨迹点
        star.trail.push({ x: star.x, y: star.y, opacity: 1 });
        if (star.trail.length > 5) star.trail.shift();
        
        // 绘制轨迹
        star.trail.forEach((point, i) => {
          const trailOpacity = (point.opacity * (i + 1) / star.trail.length) * opacity * 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${trailOpacity})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, star.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // 绘制星星
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加闪烁效果
        if (Math.random() < 0.01) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 绘制光点粒子
      lightParticles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
        
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = particle.maxLife;
        }
        
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // 绘制雪花
      snowflakes.forEach((flake) => {
        flake.y += flake.speed;
        flake.rotation += 0.02;
        if (canvas && flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.rotation);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          ctx.lineTo(0, -flake.radius);
          ctx.rotate(Math.PI / 3);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // 绘制心形
      heartsRef.current.forEach((heart) => {
        heart.y += heart.speed;
        heart.rotation += 0.01;
        if (canvas && heart.y > canvas.height + 50) {
          heart.y = -50;
          heart.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha = heart.opacity;
        ctx.fillStyle = '#ff6b9d';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6b9d';
        drawHeart(ctx, heart.x, heart.y, heart.size, heart.rotation);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      // 绘制流星
      meteorsRef.current.forEach((meteor) => {
        meteor.y += meteor.speed;
        meteor.x += meteor.speed * 0.5;
        if (canvas && (meteor.y > canvas.height + 100 || meteor.x > canvas.width + 100)) {
          meteor.y = -50;
          meteor.x = Math.random() * canvas.width * 0.5;
        }
        ctx.save();
        ctx.globalAlpha = meteor.opacity;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.length, meteor.y - meteor.length);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      // 绘制烟花
      fireworksRef.current = fireworksRef.current.filter((firework) => {
        firework.particles = firework.particles.filter((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          particle.life -= 0.02;
          particle.vy += 0.1; // 重力
          
          if (particle.life > 0) {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(firework.x + particle.x, firework.y + particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();
            return true;
          }
          return false;
        });
        return firework.particles.length > 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    const handleClick = (e: MouseEvent) => {
      setClicked(true);
      setTimeout(() => setClicked(false), 300);
      createFirework(e.clientX, e.clientY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    // 自动触发烟花
    const autoFirework = setInterval(() => {
      if (canvas) {
        createFirework(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.5
        );
      }
    }, 3000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(autoFirework);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-pink-950 overflow-hidden cursor-pointer">
      {/* 背景画布 - 增强效果 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* 动态背景光效 - 增强版 */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 400 + 150}px`,
              height: `${Math.random() * 400 + 150}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(${
                [
                  '255, 215, 0',
                  '255, 107, 107',
                  '78, 205, 196',
                  '255, 230, 109',
                  '255, 0, 255',
                  '0, 255, 255',
                  '255, 159, 243'
                ][Math.floor(Math.random() * 7)]
              }, ${0.15 + Math.random() * 0.25}) 0%, transparent 70%)`,
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, Math.random() * 300 - 150, 0],
              y: [0, Math.random() * 300 - 150, 0],
              scale: [1, 1.8, 1],
              opacity: [0.15, 0.6, 0.15],
            }}
            transition={{
              duration: 10 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* 气球装饰 */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`balloon-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${Math.random() * 20}%`,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1.1, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <motion.div
              className="relative"
              style={{
                width: '60px',
                height: '80px',
                background: `linear-gradient(135deg, ${
                  ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffd700', '#ff00ff', '#00ffff', '#ff9ff3', '#ff6b9d'][i % 8]
                } 0%, ${
                  ['#ff5252', '#26a69a', '#ffd54f', '#ffc107', '#e91e63', '#00bcd4', '#e1bee7', '#ff8fab'][i % 8]
                } 100%)`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: '2px',
                height: '100px',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), transparent)',
              }}
              animate={{
                scaleY: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* 生日祝福标题 - 增强版 */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: clicked ? 1.1 : 1 
          }}
          transition={{ duration: 1 }}
          className="text-center mb-6"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4"
            style={{
              background: 'linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffe66d, #ff00ff, #00ffff, #ffd700)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 107, 107, 0.6))',
            }}
            animate={{
              scale: [1, 1.08, 1],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              filter: [
                'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 107, 107, 0.6))',
                'drop-shadow(0 0 50px rgba(255, 215, 0, 1)) drop-shadow(0 0 100px rgba(255, 107, 107, 0.8))',
                'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 107, 107, 0.6))',
              ],
            }}
            transition={{
              scale: { duration: 2.5, repeat: Infinity },
              backgroundPosition: { duration: 4, repeat: Infinity },
              filter: { duration: 2, repeat: Infinity },
            }}
          >
            生日快乐！
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl text-white/90 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            亲爱的妈妈
          </motion.p>
          <motion.p
            className="text-xl md:text-2xl text-yellow-200 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            🎄 12月26日 🎄
          </motion.p>
        </motion.div>

        {/* 3D 立体圣诞树容器 - 增强版 */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
          animate={{ 
            opacity: 1, 
            scale: clicked ? 1.05 : 1,
            rotateY: 0,
            rotateX: mousePos.y,
            rotateZ: mousePos.x * 0.1,
          }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div 
            className="relative"
            style={{ 
              width: '350px', 
              height: '450px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D 树冠层 1 */}
            <div 
              className="absolute bottom-0 left-1/2"
              style={{
                transform: 'translateX(-50%) translateZ(0px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="relative"
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '90px solid transparent',
                  borderRight: '90px solid transparent',
                  borderBottom: '130px solid #0d7a3d',
                  filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8)) drop-shadow(0 10px 40px rgba(0, 0, 0, 0.6))',
                  transform: 'rotateX(5deg)',
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const radius = 60;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '18px',
                        height: '18px',
                        left: `${50 + x / 2}%`,
                        top: `${30 + Math.floor(i / 4) * 35}%`,
                        backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b'][i % 6],
                        boxShadow: '0 0 20px currentColor, 0 0 40px currentColor',
                        transform: `translateZ(${z}px)`,
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.5, 1],
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3D 树冠层 2 */}
            <div 
              className="absolute bottom-24 left-1/2"
              style={{
                transform: 'translateX(-50%) translateZ(20px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="relative"
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '110px solid transparent',
                  borderRight: '110px solid transparent',
                  borderBottom: '150px solid #0fa050',
                  filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8)) drop-shadow(0 10px 40px rgba(0, 0, 0, 0.6))',
                  transform: 'rotateX(3deg)',
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const angle = (i / 10) * Math.PI * 2;
                  const radius = 70;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '20px',
                        height: '20px',
                        left: `${50 + x / 2.2}%`,
                        top: `${35 + Math.floor(i / 5) * 40}%`,
                        backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b'][i % 6],
                        boxShadow: '0 0 25px currentColor, 0 0 50px currentColor',
                        transform: `translateZ(${z}px)`,
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.6, 1],
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3D 树冠层 3 */}
            <div 
              className="absolute bottom-48 left-1/2"
              style={{
                transform: 'translateX(-50%) translateZ(40px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="relative"
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '130px solid transparent',
                  borderRight: '130px solid transparent',
                  borderBottom: '170px solid #15b85a',
                  filter: 'drop-shadow(0 0 25px rgba(0, 255, 0, 0.9)) drop-shadow(0 15px 50px rgba(0, 0, 0, 0.7))',
                  transform: 'rotateX(2deg)',
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const radius = 80;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '22px',
                        height: '22px',
                        left: `${50 + x / 2.6}%`,
                        top: `${40 + Math.floor(i / 4) * 45}%`,
                        backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b'][i % 6],
                        boxShadow: '0 0 30px currentColor, 0 0 60px currentColor',
                        transform: `translateZ(${z}px)`,
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.7, 1],
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.12,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3D 树顶星星 - 增强版 */}
            <motion.div
              className="absolute top-0 left-1/2"
              style={{
                transform: 'translateX(-50%) translateZ(60px)',
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity },
              }}
            >
              <div
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '30px solid transparent',
                  borderRight: '30px solid transparent',
                  borderBottom: '60px solid #ffd700',
                  filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 1)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
                }}
              />
              <div
                className="absolute top-12 left-1/2 transform -translate-x-1/2"
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '30px solid transparent',
                  borderRight: '30px solid transparent',
                  borderTop: '60px solid #ffd700',
                }}
              />
            </motion.div>

            {/* 3D 树干 */}
            <div
              className="absolute bottom-0 left-1/2"
              style={{
                transform: 'translateX(-50%) translateZ(-10px)',
                width: '50px',
                height: '70px',
                backgroundColor: '#8b4513',
                borderRadius: '6px',
                boxShadow: '0 0 20px rgba(139, 69, 19, 0.8), 0 10px 40px rgba(0, 0, 0, 0.6)',
              }}
            />
          </div>
        </motion.div>

        {/* 改进的生日蛋糕 - 增强版 */}
        <motion.div
          className="relative mb-8 flex justify-center items-center w-full"
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotateX: 0,
            rotateY: mousePos.x * 0.1,
            scale: clicked ? 1.05 : 1,
          }}
          transition={{ duration: 1.2, delay: 0.8 }}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative" style={{ width: '220px', height: '200px' }}>
            {/* 底层蛋糕 */}
            <div
              className="absolute bottom-0"
              style={{
                left: '50%',
                width: '200px',
                height: '70px',
                background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 50%, #ff6b9d 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 35px rgba(255, 107, 157, 0.6), 0 0 40px rgba(255, 107, 157, 0.4)',
                transform: 'translateX(-50%) translateZ(0px)',
              }}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: '24px',
                    height: '24px',
                    left: `${10 + i * 20}px`,
                    top: '-12px',
                    boxShadow: '0 3px 15px rgba(255, 255, 255, 0.8)',
                  }}
                  animate={{
                    y: [0, -4, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>

            {/* 中层蛋糕 */}
            <div
              className="absolute bottom-16"
              style={{
                left: '50%',
                width: '160px',
                height: '60px',
                background: 'linear-gradient(135deg, #ffb3ba 0%, #ffc5cc 50%, #ffb3ba 100%)',
                borderRadius: '10px',
                boxShadow: '0 10px 35px rgba(255, 179, 186, 0.6), 0 0 40px rgba(255, 179, 186, 0.4)',
                transform: 'translateX(-50%) translateZ(20px)',
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: '22px',
                    height: '22px',
                    left: `${8 + i * 18}px`,
                    top: '-11px',
                    boxShadow: '0 3px 15px rgba(255, 255, 255, 0.8)',
                  }}
                  animate={{
                    y: [0, -4, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                />
              ))}
            </div>

            {/* 顶层蛋糕 */}
            <div
              className="absolute bottom-28"
              style={{
                left: '50%',
                width: '120px',
                height: '50px',
                background: 'linear-gradient(135deg, #ffd1dc 0%, #ffe5ea 50%, #ffd1dc 100%)',
                borderRadius: '8px',
                boxShadow: '0 10px 35px rgba(255, 209, 220, 0.6), 0 0 40px rgba(255, 209, 220, 0.4)',
                transform: 'translateX(-50%) translateZ(40px)',
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: '20px',
                    height: '20px',
                    left: `${8 + i * 18}px`,
                    top: '-10px',
                    boxShadow: '0 3px 15px rgba(255, 255, 255, 0.8)',
                  }}
                  animate={{
                    y: [0, -4, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>

            {/* 3D蜡烛 */}
            {Array.from({ length: 3 }).map((_, i) => {
              const candleCenter = 110 + (i - 1) * 30;
              const candleLeft = candleCenter - 5;
              return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${candleLeft}px`,
                  bottom: '180px',
                  transform: `translateZ(${60 + i * 5}px)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateY: [0, 8, -8, 0],
                }}
                transition={{ 
                  opacity: { delay: 1.2 + i * 0.1 },
                  scale: { delay: 1.2 + i * 0.1 },
                  rotateY: { duration: 3, repeat: Infinity, delay: i * 0.5 },
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '35px',
                    background: `linear-gradient(135deg, ${['#ff6b6b', '#4ecdc4', '#ffe66d'][i]} 0%, ${['#ff5252', '#26a69a', '#ffd54f'][i]} 100%)`,
                    borderRadius: '5px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '20px solid #ffd700',
                    filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 1)) drop-shadow(0 0 30px rgba(255, 140, 0, 0.8))',
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.9, 1, 0.9],
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute top-1 left-1/2 transform -translate-x-1/2"
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '14px solid #ff6b00',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 改进的祝福文字 - 增强版 */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div
            className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed space-y-2"
            animate={{
              textShadow: [
                '0 0 15px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 107, 107, 0.4)',
                '0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 107, 107, 0.7)',
                '0 0 15px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 107, 107, 0.4)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <motion.p
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              愿您在新的一岁里
            </motion.p>
            <motion.p
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              健康快乐，幸福美满
            </motion.p>
            <motion.p
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              所有的愿望都能实现
            </motion.p>
            <motion.p
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
            >
              所有的美好都如期而至
            </motion.p>
          </motion.div>
          <motion.p
            className="text-4xl md:text-5xl font-bold mt-8"
            style={{
              background: 'linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffe66d, #ff00ff, #00ffff, #ffd700)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 107, 107, 0.6))',
            }}
            animate={{
              scale: [1, 1.15, 1],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              filter: [
                'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 107, 107, 0.6))',
                'drop-shadow(0 0 50px rgba(255, 215, 0, 1)) drop-shadow(0 0 100px rgba(255, 107, 107, 0.9))',
                'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 107, 107, 0.6))',
              ],
            }}
            transition={{
              scale: { duration: 2.5, repeat: Infinity },
              backgroundPosition: { duration: 4, repeat: Infinity },
              filter: { duration: 2, repeat: Infinity },
            }}
          >
            🎂 生日快乐 🎉
          </motion.p>
        </motion.div>

        {/* 额外的装饰元素 - 增强版彩带 */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                width: '5px',
                height: '120px',
                background: `linear-gradient(to bottom, ${
                  ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffd700', '#ff00ff', '#00ffff', '#ff9ff3'][i % 7]
                }, transparent)`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
                boxShadow: `0 0 10px ${
                  ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffd700', '#ff00ff', '#00ffff', '#ff9ff3'][i % 7]
                }`,
              }}
              animate={{
                y: [0, 1400],
                x: [0, Math.random() * 120 - 60],
                rotate: [0, Math.random() * 720],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
