'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function BirthdayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 雪花效果
    const snowflakes: Array<{ x: number; y: number; radius: number; speed: number; opacity: number; rotation: number }> = [];
    for (let i = 0; i < 80; i++) {
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
    const stars: Array<{ x: number; y: number; size: number; twinkle: number }> = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random(),
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制星星
      stars.forEach((star) => {
        star.twinkle += 0.02;
        const opacity = (Math.sin(star.twinkle) + 1) / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
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
        // 绘制六角雪花
        for (let i = 0; i < 6; i++) {
          ctx.lineTo(0, -flake.radius);
          ctx.rotate(Math.PI / 3);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
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

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-pink-950 overflow-hidden">
      {/* 背景画布 - 雪花和星星 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* 动态背景光效 */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(${Math.random() > 0.5 ? '255, 215, 0' : '255, 107, 107'}, ${0.2 + Math.random() * 0.3}) 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* 生日祝福标题 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-6"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4"
            style={{
              background: 'linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffe66d, #ffd700)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
            }}
            animate={{
              scale: [1, 1.05, 1],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              backgroundPosition: { duration: 3, repeat: Infinity },
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

        {/* 3D 立体圣诞树容器 */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
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
            {/* 3D 树冠层 1 - 使用3D变换 */}
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
                  filter: 'drop-shadow(0 0 15px rgba(0, 255, 0, 0.6)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))',
                  transform: 'rotateX(5deg)',
                }}
              >
                {/* 3D装饰球 */}
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
                        width: '16px',
                        height: '16px',
                        left: `${50 + x / 2}%`,
                        top: `${30 + Math.floor(i / 4) * 35}%`,
                        backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b'][i % 6],
                        boxShadow: '0 0 15px currentColor, 0 0 30px currentColor',
                        transform: `translateZ(${z}px)`,
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.4, 1],
                        y: [0, -5, 0],
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
                  filter: 'drop-shadow(0 0 15px rgba(0, 255, 0, 0.6)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))',
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
                        width: '18px',
                        height: '18px',
                        left: `${50 + x / 2.2}%`,
                        top: `${35 + Math.floor(i / 5) * 40}%`,
                        backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b'][i % 6],
                        boxShadow: '0 0 20px currentColor, 0 0 40px currentColor',
                        transform: `translateZ(${z}px)`,
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.5, 1],
                        y: [0, -5, 0],
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
                  filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.7)) drop-shadow(0 15px 40px rgba(0, 0, 0, 0.6))',
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
                        width: '20px',
                        height: '20px',
                        left: `${50 + x / 2.6}%`,
                        top: `${40 + Math.floor(i / 4) * 45}%`,
                        backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b'][i % 6],
                        boxShadow: '0 0 25px currentColor, 0 0 50px currentColor',
                        transform: `translateZ(${z}px)`,
                      }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.6, 1],
                        y: [0, -5, 0],
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

            {/* 3D 树顶星星 */}
            <motion.div
              className="absolute top-0 left-1/2"
              style={{
                transform: 'translateX(-50%) translateZ(60px)',
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.2, 1],
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
                  borderLeft: '25px solid transparent',
                  borderRight: '25px solid transparent',
                  borderBottom: '50px solid #ffd700',
                  filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 50px rgba(255, 215, 0, 0.6))',
                }}
              />
              <div
                className="absolute top-10 left-1/2 transform -translate-x-1/2"
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '25px solid transparent',
                  borderRight: '25px solid transparent',
                  borderTop: '50px solid #ffd700',
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
                boxShadow: '0 0 15px rgba(139, 69, 19, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </motion.div>

        {/* 改进的生日蛋糕 */}
        <motion.div
          className="relative mb-8 flex justify-center items-center w-full"
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotateX: 0,
            rotateY: mousePos.x * 0.1,
          }}
          transition={{ duration: 1.2, delay: 0.8 }}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative" style={{ width: '220px', height: '200px' }}>
            {/* 底层蛋糕 - 3D效果 */}
            <div
              className="absolute bottom-0"
              style={{
                left: '50%',
                width: '200px',
                height: '70px',
                background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(255, 107, 157, 0.5), 0 0 30px rgba(255, 107, 157, 0.3)',
                transform: 'translateX(-50%) translateZ(0px)',
              }}
            >
              {/* 3D奶油装饰 */}
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: '22px',
                    height: '22px',
                    left: `${10 + i * 20}px`,
                    top: '-11px',
                    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.6)',
                  }}
                  animate={{
                    y: [0, -3, 0],
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
                background: 'linear-gradient(135deg, #ffb3ba 0%, #ffc5cc 100%)',
                borderRadius: '10px',
                boxShadow: '0 8px 25px rgba(255, 179, 186, 0.5), 0 0 30px rgba(255, 179, 186, 0.3)',
                transform: 'translateX(-50%) translateZ(20px)',
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: '20px',
                    height: '20px',
                    left: `${8 + i * 18}px`,
                    top: '-10px',
                    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.6)',
                  }}
                  animate={{
                    y: [0, -3, 0],
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
                background: 'linear-gradient(135deg, #ffd1dc 0%, #ffe5ea 100%)',
                borderRadius: '8px',
                boxShadow: '0 8px 25px rgba(255, 209, 220, 0.5), 0 0 30px rgba(255, 209, 220, 0.3)',
                transform: 'translateX(-50%) translateZ(40px)',
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: '18px',
                    height: '18px',
                    left: `${8 + i * 18}px`,
                    top: '-9px',
                    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.6)',
                  }}
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>

            {/* 3D蜡烛 - 居中在顶层蛋糕上 */}
            {Array.from({ length: 3 }).map((_, i) => {
              // 容器宽度220px，中心110px
              // 顶层蛋糕120px宽，使用left-1/2 transform -translate-x-1/2，中心在110px
              // 3根蜡烛，每根10px宽，间距20px
              // 第一根蜡烛中心应该在110px（容器中心），所以left = 110 - 5 = 105px
              // 第二根蜡烛中心在110 + 30 = 140px，left = 140 - 5 = 135px
              // 第三根蜡烛中心在110 + 60 = 170px，left = 170 - 5 = 165px
              const candleCenter = 110 + (i - 1) * 30; // 每根蜡烛中心间距30px
              const candleLeft = candleCenter - 5; // 蜡烛宽度10px，所以left = 中心 - 5
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
                  rotateY: [0, 5, -5, 0],
                }}
                transition={{ 
                  opacity: { delay: 1.2 + i * 0.1 },
                  scale: { delay: 1.2 + i * 0.1 },
                  rotateY: { duration: 3, repeat: Infinity, delay: i * 0.5 },
                }}
              >
                {/* 蜡烛 */}
                <div
                  style={{
                    width: '10px',
                    height: '35px',
                    background: `linear-gradient(135deg, ${['#ff6b6b', '#4ecdc4', '#ffe66d'][i]} 0%, ${['#ff5252', '#26a69a', '#ffd54f'][i]} 100%)`,
                    borderRadius: '5px',
                    boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
                  }}
                />
                {/* 3D火焰 */}
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '18px solid #ffd700',
                    filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 20px rgba(255, 140, 0, 0.6))',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.9, 1, 0.9],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                  }}
                />
                {/* 火焰内层 */}
                <motion.div
                  className="absolute top-1 left-1/2 transform -translate-x-1/2"
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderBottom: '12px solid #ff6b00',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
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

        {/* 改进的祝福文字 */}
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
                '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 107, 107, 0.3)',
                '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 107, 107, 0.5)',
                '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 107, 107, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              愿您在新的一岁里
            </motion.p>
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              健康快乐，幸福美满
            </motion.p>
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              所有的愿望都能实现
            </motion.p>
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
            >
              所有的美好都如期而至
            </motion.p>
          </motion.div>
          <motion.p
            className="text-4xl md:text-5xl font-bold mt-8"
            style={{
              background: 'linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffe66d, #ffd700)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
            }}
            animate={{
              scale: [1, 1.1, 1],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              backgroundPosition: { duration: 3, repeat: Infinity },
            }}
          >
            🎂 生日快乐 🎉
          </motion.p>
        </motion.div>

        {/* 额外的装饰元素 - 飘落的彩带 */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                width: '4px',
                height: '100px',
                background: `linear-gradient(to bottom, ${['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffd700', '#ff00ff'][i % 5]}, transparent)`,
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
              }}
              animate={{
                y: [0, 1200],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
