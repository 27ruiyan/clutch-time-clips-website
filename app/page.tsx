"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"

// Custom TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.26z" />
  </svg>
)

// Animated Counter Component
const AnimatedCounter = ({
  target,
  startScroll,
  currentScroll,
  suffix = "",
  finalText,
}: {
  target: number
  startScroll: number
  currentScroll: number
  suffix?: string
  finalText: string
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [showFinalText, setShowFinalText] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (currentScroll >= startScroll && !hasAnimated) {
      setHasAnimated(true)
      let startTime: number | null = null
      const duration = 3000 // 3 seconds

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)

        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setDisplayValue(Math.floor(target * easeOutQuart))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // After count animation, wait 1 second then show final text
          setTimeout(() => {
            setShowFinalText(true)
          }, 1000)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [currentScroll, startScroll, target, hasAnimated])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const renderDigitByDigitCollapse = () => {
    const fullNumber = formatNumber(displayValue) + suffix
    const digits = fullNumber.split("")

    return (
      <div className="relative w-full">
        <div className="flex justify-end md:justify-center lg:justify-end">
          {digits.map((digit, index) => (
            <span
              key={index}
              className={`inline-block transition-all duration-200 ${
                showFinalText ? "transform scale-0 opacity-0" : "transform scale-100 opacity-100"
              }`}
              style={{
                transitionDelay: showFinalText ? `${index * 100}ms` : "0ms",
              }}
            >
              {digit}
            </span>
          ))}
        </div>
        <div
          className={`absolute top-0 left-0 w-full flex justify-end md:justify-center lg:justify-end transition-all duration-500 ${
            showFinalText
              ? "transform translate-x-0 opacity-100 animate-float-subtle"
              : "transform translate-x-full opacity-0"
          }`}
          style={{
            transitionDelay: showFinalText ? `${digits.length * 100 + 500}ms` : "0ms",
          }}
        >
          {finalText}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {renderDigitByDigitCollapse()}
    </div>
  )
}

// Email Copy Component
const EmailCopy = ({ email, label }: { email: string; label: string }) => {
  const [copied, setCopied] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy email:", err)
    }
  }

  return (
    <div className="text-center">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-md">{label}</h3>
      <div
        onClick={copyEmail}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          cursor-pointer text-lg md:text-xl font-semibold text-white 
          transition-all duration-300 relative overflow-hidden
          px-8 py-4 rounded-xl backdrop-blur-sm
          group hover:scale-105 transform
          ${
            copied
              ? "bg-green-500/90 shadow-[0_0_25px_rgba(34,197,94,0.6)] ring-2 ring-green-300/60"
              : "bg-black/20 hover:bg-black/30 hover:shadow-[0_0_35px_rgba(255,255,0,0.7),0_0_70px_rgba(255,255,0,0.5),0_0_105px_rgba(255,255,0,0.3)] hover:ring-2 hover:ring-yellow-300/60"
          }
        `}
      >
        <span className="relative z-10 block">{copied ? "Copied!" : isHovering ? "Click to copy" : email}</span>
        {/* Enhanced glow overlay with larger radius */}
        <div className="absolute inset-0 bg-gradient-radial from-yellow-300/25 via-yellow-200/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md rounded-xl"></div>
        {/* Additional outer glow for smoother transition */}
        <div className="absolute -inset-2 bg-gradient-radial from-yellow-300/10 via-yellow-200/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-lg rounded-2xl"></div>
      </div>
    </div>
  )
}

// Trophy Animation Component
const TrophyAnimation = ({
  side,
  scrollY,
  statsStart,
  statsMidpoint,
}: {
  side: "left" | "right"
  scrollY: number
  statsStart: number
  statsMidpoint: number
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldExit, setShouldExit] = useState(false)
  const [windowHeight, setWindowHeight] = useState(800) // Default fallback
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Set window height on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight)

      const handleResize = () => {
        setWindowHeight(window.innerHeight)
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Calculate animation states based on scroll position
  const entryProgress = Math.max(0, Math.min(1, (scrollY - statsStart) / (windowHeight * 0.15)))
  const exitProgress = Math.max(0, Math.min(1, (scrollY - statsMidpoint) / (windowHeight * 0.15)))

  // Determine visibility based on scroll position
  const shouldBeVisible = scrollY >= statsStart && scrollY < statsMidpoint
  const shouldBeExiting = scrollY >= statsMidpoint

  useEffect(() => {
    if (shouldBeVisible && !isVisible && !shouldExit) {
      setIsVisible(true)
      setShouldExit(false)
    } else if (!shouldBeVisible && isVisible) {
      setIsVisible(false)
    }

    if (shouldBeExiting && !shouldExit) {
      setShouldExit(true)
    } else if (!shouldBeExiting && shouldExit) {
      setShouldExit(false)
    }
  }, [shouldBeVisible, shouldBeExiting, isVisible, shouldExit])

  // Simple video play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoError) return

    if (isVisible && !shouldExit && videoLoaded) {
      video.currentTime = 0
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error)
      })
    } else {
      video.pause()
    }
  }, [isVisible, shouldExit, videoLoaded, videoError])

  // Calculate transform values with final tilt of ±23 degrees and better positioning
  const getTransform = () => {
    if (shouldExit) {
      // Exit animation
      const exitX = side === "left" ? -400 - exitProgress * 400 : 400 + exitProgress * 400
      const exitRotate = side === "left" ? -60 - exitProgress * 20 : 60 + exitProgress * 20
      return `translateX(${exitX}px) rotate(${exitRotate}deg) scale(${1.4036 - exitProgress * 0.42108})`
    } else if (isVisible) {
      // Entry animation with final tilt of ±23 degrees and better positioning to avoid text
      const entryX = side === "left" ? -400 + entryProgress * 250 : 400 - entryProgress * 250 // More distance from center
      const entryRotate = side === "left" ? -60 + entryProgress * 37 : 60 - entryProgress * 37 // Final tilt: -23° and +23°
      const entryScale = 0.84216 + entryProgress * 0.56144
      return `translateX(${entryX}px) rotate(${entryRotate}deg) scale(${entryScale})`
    } else {
      // Hidden state
      const hiddenX = side === "left" ? -500 : 500
      const hiddenRotate = side === "left" ? -75 : 75
      return `translateX(${hiddenX}px) rotate(${hiddenRotate}deg) scale(0.7018)`
    }
  }

  const opacity = shouldExit ? 1 - exitProgress : isVisible ? entryProgress : 0

  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video failed to load:", e.currentTarget.error)
    setVideoError(true)
  }

  // Handle video load success
  const handleVideoLoad = () => {
    console.log("Video loaded successfully")
    setVideoLoaded(true)
    setVideoError(false)
  }

  return (
    <div
      className={`fixed z-30 pointer-events-none transition-all duration-700 ease-out ${
        side === "left" ? "left-0 md:left-4" : "right-0 md:right-4"
      }`}
      style={{
        top: "50%",
        transform: `translateY(-50%) ${getTransform()}`,
        opacity: opacity,
      }}
    >
      {videoError ? (
        // Fallback content when video fails to load
        <div
          className={`w-96 h-96 md:w-128 md:h-128 lg:w-144 lg:h-144 flex items-center justify-center ${
            isVisible && !shouldExit ? "animate-trophy-loop" : ""
          }`}
          style={{
            filter: "drop-shadow(0 10px 20px rgba(255, 215, 0, 0.3))",
          }}
        >
          <div className="text-yellow-300 text-8xl animate-bounce">🏆</div>
        </div>
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          className={`w-96 h-96 md:w-128 md:h-128 lg:w-144 lg:h-144 object-contain drop-shadow-2xl ${
            isVisible && !shouldExit ? "animate-trophy-loop" : ""
          }`}
          style={{
            filter: "drop-shadow(0 10px 20px rgba(255, 215, 0, 0.3))",
          }}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
        >
          {/* Primary WebM source */}
          <source src={side === "left" ? "/wreath-trophy.webm" : "/nba-trophy.webm"} type="video/webm" />
          {/* Fallback MP4 source */}
          <source src={side === "left" ? "/wreath-trophy.mp4" : "/nba-trophy.mp4"} type="video/mp4" />
          {/* Fallback content for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
      )}

      {/* Loading indicator */}
      {!videoLoaded && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-yellow-300 text-4xl animate-pulse">🏆</div>
        </div>
      )}
    </div>
  )
}

interface SocialLink {
  name: string
  url: string
  icon: React.ReactNode
  color: string
}

export default function BasketballPortfolio() {
  const [scrollY, setScrollY] = useState(0)
  const [emailCopied, setEmailCopied] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 1024, height: 800 }) // Default fallbacks
  const [isClient, setIsClient] = useState(false)
  const businessEmail = "contact@clutchtimeclips.com"

  const socialLinks: SocialLink[] = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/clutch_time_clips",
      icon: <Instagram className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@clutch_time_clips",
      icon: <TikTokIcon className="w-8 h-8" />,
      color: "from-black to-gray-800",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@clutch_time_clips",
      icon: <Youtube className="w-8 h-8" />,
      color: "from-red-500 to-red-600",
    },
  ]

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }, [])

  useEffect(() => {
    if (!isClient) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (typeof window !== "undefined") {
            setScrollY(window.scrollY)
          }
          ticking = false
        })
        ticking = true
      }
    }

    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true })
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [isClient])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(businessEmail)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 1500) // Changed to 1.5 seconds
    } catch (err) {
      console.error("Failed to copy email:", err)
    }
  }

  // Use windowDimensions instead of direct window access
  const { width: windowWidth, height: windowHeight } = windowDimensions

  // Calculate scroll-based transformations
  const balloonTransform = Math.max(0, scrollY - windowHeight * 0.12) // Start moving background at 12% scroll
  const transitionStart = windowHeight * 0.11 // Start transition at 11% scroll
  const videoStart = windowHeight * 0.18 // Start video at 18% scroll
  const statsTextStart = windowHeight * 0.15 // Start "View Count" text at 15% scroll
  const transitionEnd = windowHeight * 0.5 // End transition faster at 50% scroll
  const transitionProgress = Math.max(0, Math.min(1, (scrollY - transitionStart) / (transitionEnd - transitionStart)))
  const statsTextProgress = Math.max(0, Math.min(1, (scrollY - statsTextStart) / (windowHeight * 0.3)))

  // Background opacity calculations for faster transition
  const heroBackgroundOpacity = Math.max(0, 1 - transitionProgress * 1.5) // Faster fade out
  const videoBackgroundOpacity = Math.min(1, transitionProgress * 1.2) // Faster fade in

  // Mobile detection
  const isMobile = windowWidth < 768

  // Trophy animation calculations - Disable on mobile
  const trophyStatsStart = isMobile
    ? undefined // Disable on mobile
    : windowHeight * 0.45 // Desktop: Start trophies at 45% viewport
  const trophyStatsMidpoint = isMobile
    ? undefined // Disable on mobile
    : windowHeight * 1.0 // Desktop: Exit at 100% viewport

  // "View Count" text animation calculations
  const ourStatsStart = isMobile 
    ? windowHeight * 0.18 // Start earlier on mobile (18% vs 27%)
    : windowHeight * 0.27 // Keep original desktop position
  const ourStatsEnd = isMobile
    ? windowHeight * 0.25 // Finish earlier on mobile  
    : windowHeight * 0.34 // Keep original desktop position
  const ourStatsProgress = Math.max(0, Math.min(1, (scrollY - ourStatsStart) / (ourStatsEnd - ourStatsStart)))
  const ourStatsOpacity = ourStatsProgress
  const ourStatsTransform = (1 - ourStatsProgress) * 50

  // Contact section animation calculations - positioned right after stats
  const contactStart = isMobile
    ? windowHeight * 0.38 // Much earlier on mobile
    : windowHeight * 0.58 // Keep original desktop position
  const contactEnd = isMobile
    ? windowHeight * 0.45 // Finish earlier on mobile
    : windowHeight * 0.65 // Keep original desktop position
  const contactProgress = Math.max(0, Math.min(1, (scrollY - contactStart) / (contactEnd - contactStart)))
  const contactOpacity = contactProgress
  const contactTransform = (1 - contactProgress) * 50

  // Get button text based on state
  const getButtonText = () => {
    if (emailCopied) return "Copied"
    if (isHovering) return "Copy Email?"
    return businessEmail
  }

  // Get button classes based on state
  const getButtonClasses = () => {
    const baseClasses =
      "text-white bg-black/20 backdrop-blur-sm transition-all duration-500 relative overflow-hidden hover:shadow-[0_0_30px_rgba(255,255,0,0.6),0_0_60px_rgba(255,255,0,0.4),0_0_90px_rgba(255,255,0,0.2)] hover:ring-1 hover:ring-yellow-300/50 min-w-[280px] justify-center"

    if (emailCopied) {
      return `${baseClasses} bg-green-500/90 shadow-[0_0_20px_rgba(34,197,94,0.5)] ring-1 ring-green-300/50`
    }

    return `${baseClasses} hover:text-gray-200 hover:bg-black/30`
  }

  return (
    <TooltipProvider>
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 pt-16 pb-6 px-6">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={copyEmail}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onTouchStart={() => setIsHovering(true)}
              onTouchEnd={() => setIsHovering(false)}
              className={`${getButtonClasses()} hidden md:flex`}
            >
              <span className="relative z-10">{getButtonText()}</span>
              {/* Angelic glow overlay */}
              <div className="absolute inset-0 bg-gradient-radial from-yellow-300/20 via-yellow-200/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </Button>
          </div>
        </nav>

        {/* Trophy Animations - Only render on desktop */}
        {isClient && !isMobile && trophyStatsStart && trophyStatsMidpoint && (
          <>
            <TrophyAnimation
              side="left"
              scrollY={scrollY}
              statsStart={trophyStatsStart}
              statsMidpoint={trophyStatsMidpoint}
            />
            <TrophyAnimation
              side="right"
              scrollY={scrollY}
              statsStart={trophyStatsStart}
              statsMidpoint={trophyStatsMidpoint}
            />
          </>
        )}

        {/* Background Layers */}
        <div className="fixed inset-0 z-0">
          {/* Hero Balloon Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: "url(/background-ctc.webp)",
              transform: `translateY(-${balloonTransform}px)`,
              opacity: heroBackgroundOpacity,
              maskImage: `linear-gradient(to bottom, 
      rgba(0,0,0,1) 0%, 
      rgba(0,0,0,1) 60%, 
      rgba(0,0,0,0.8) 75%, 
      rgba(0,0,0,0.4) 85%, 
      rgba(0,0,0,0.1) 95%, 
      rgba(0,0,0,0) 100%
    )`,
              WebkitMaskImage: `linear-gradient(to bottom, 
      rgba(0,0,0,1) 0%, 
      rgba(0,0,0,1) 60%, 
      rgba(0,0,0,0.8) 75%, 
      rgba(0,0,0,0.4) 85%, 
      rgba(0,0,0,0.1) 95%, 
      rgba(0,0,0,0) 100%
    )`,
            }}
          />

          {/* Pink Fade Overlay for Hero Bottom - Less Prevalent */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                transparent 70%,
                rgba(236, 72, 153, ${transitionProgress * 0.15}) 80%,
                rgba(219, 39, 119, ${transitionProgress * 0.25}) 90%,
                rgba(190, 24, 93, ${transitionProgress * 0.35}) 95%,
                rgba(157, 23, 77, ${transitionProgress * 0.45}) 100%
              )`,
              opacity: transitionProgress > 0 ? 1 : 0,
              transition: "opacity 0.3s ease-out",
            }}
          />

          {/* Video Background for Statistics */}
          <div
            className="absolute inset-0 overflow-hidden transition-opacity duration-1000"
            style={{ opacity: videoBackgroundOpacity }}
          >
            <video
              ref={(video) => {
                if (video && isClient) {
                  // Calculate video progress based on scroll position
                  const videoStart = windowHeight * 0.18
                  const videoHeight = windowHeight * 1.5 // Reduced height to match content
                  const scrollProgress = Math.max(0, Math.min(1, (scrollY - videoStart) / videoHeight))

                  // Set video time based on scroll progress
                  if (video.duration) {
                    video.currentTime = scrollProgress * video.duration
                  }
                }
              }}
              muted
              playsInline
              className="w-full h-full object-cover"
              preload="metadata"
            >
              <source
                src="https://cdn.jsdelivr.net/gh/27ruiyan/v0-assets/20250615_2225_Serene Sky Animation_simple_compose_01jxv8xcqsfbja93a4cvkpchmn.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-6">
            {/* Scrolling Banner */}
            <div className="absolute top-0 left-0 w-full overflow-hidden py-4 z-20">
              <div className="whitespace-nowrap animate-scroll-infinite flex items-center">
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/62 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
                <span className="text-xl font-bold text-white/60 mx-8">Edits ~ Top 5 Moments ~ Custom Mixtapes</span>
                <img src="/rodman-player.png" alt="Basketball player" className="h-16 mx-4 inline-block" />
              </div>
            </div>
            <div
              className="text-center transition-transform duration-300"
              style={{
                transform: `translateY(-${scrollY * 0.3}px)`,
                opacity: Math.max(0.2, 1 - transitionProgress * 1.2), // Faster fade out for content
              }}
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 drop-shadow-2xl">Clutch Time Clips</h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 drop-shadow-lg italic">
                Showcasing the Best Basketball Content
              </p>

              {/* Social Links as Balloons */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {socialLinks.map((link, index) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="group">
                    <div
                      className={`
                        w-24 h-24 md:w-32 md:h-32 rounded-full 
                        bg-gradient-to-br ${link.color}
                        flex items-center justify-center
                        shadow-2xl hover:shadow-3xl
                        transform hover:scale-110 transition-all duration-500
                        animate-bounce
                        text-white
                        relative overflow-hidden
                        hover:shadow-[0_0_30px_rgba(255,255,0,0.6),0_0_60px_rgba(255,255,0,0.4),0_0_90px_rgba(255,255,0,0.2)]
                        hover:ring-1 hover:ring-yellow-300/50
                      `}
                      style={{
                        animationDelay: `${index * 0.5}s`,
                        animationDuration: "3s",
                        transform: `translateY(-${scrollY * 0.8}px) scale(${1 - Math.min(scrollY / 1000, 0.5)})`,
                      }}
                    >
                      <span className="relative z-10">{link.icon}</span>
                      {/* Angelic glow overlay for balloons */}
                      <div className="absolute inset-0 bg-gradient-radial from-yellow-300/20 via-yellow-200/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm rounded-full"></div>
                    </div>
                    <p className="text-white mt-4 font-semibold drop-shadow-lg">{link.name}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* View Count Text - Adjusted positioning for mobile */}
          <div
            className="absolute text-center text-white z-20 w-full px-6"
            style={{
              top: isMobile 
                ? `${windowHeight * 0.88}px` // Much closer to hero on mobile
                : `${windowHeight * 0.27 + windowHeight * 0.5}px`, // Keep original desktop position
              opacity: ourStatsOpacity,
              transform: `translateY(${ourStatsTransform}px)`,
              transition: ourStatsProgress >= 1 ? "none" : "opacity 0.3s ease-out, transform 0.3s ease-out",
            }}
          >
            <h2 className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-8xl'} font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]`}>
              View Count
            </h2>
          </div>

          {/* Statistics Section - Reduced padding on mobile */}
          <section id="stats-section" className={`relative flex items-start justify-center px-6 ${isMobile ? 'pt-16 pb-12' : 'pt-32 pb-24'}`}>
            <div className="w-full max-w-2xl mx-auto">
              {/* TikTok Stats */}
              <div
                className={`grid grid-cols-2 items-center gap-0 md:grid-cols-1 md:justify-center md:gap-1 lg:grid-cols-2 lg:gap-2 ${isMobile ? 'mb-6' : 'mb-8 md:mb-10'}`}
                style={{
                  opacity: Math.max(0, Math.min(1, (scrollY - (isMobile ? windowHeight * 0.25 : windowHeight * 0.35)) / (windowHeight * 0.08))),
                }}
              >
                <div className="text-left md:text-center lg:text-left">
                  <h3
                    className={`${isMobile ? 'text-3xl' : 'text-3xl md:text-6xl'} font-bold text-white drop-shadow-md md:ml-0 lg:ml-0`}
                    style={{
                      position: "relative",
                      transform: "translateZ(0)",
                      willChange: "auto",
                    }}
                  >
                    TikTok
                  </h3>
                </div>
                <div className="text-center md:text-center lg:text-right">
                  <div className={`${isMobile ? 'text-2xl' : 'text-2xl md:text-5xl'} font-bold text-white drop-shadow-md`}>
                    <AnimatedCounter
                      target={5000000}
                      startScroll={isMobile ? windowHeight * 0.25 : windowHeight * 0.35}
                      currentScroll={scrollY}
                      suffix="+"
                      finalText="5 Million+"
                    />
                  </div>
                </div>
              </div>

              {/* YouTube Stats */}
              <div
                className={`grid grid-cols-2 items-center gap-0 md:grid-cols-1 md:justify-center md:gap-1 lg:grid-cols-2 lg:gap-2 ${isMobile ? 'mb-6' : 'mb-8 md:mb-10'}`}
                style={{
                  opacity: Math.max(0, Math.min(1, (scrollY - (isMobile ? windowHeight * 0.28 : windowHeight * 0.4)) / (windowHeight * 0.08))),
                }}
              >
                <div className="text-left md:text-center lg:text-left">
                  <h3
                    className={`${isMobile ? 'text-3xl' : 'text-3xl md:text-6xl'} font-bold text-white drop-shadow-md md:ml-0 lg:ml-0`}
                    style={{
                      position: "relative",
                      transform: "translateZ(0)",
                      willChange: "auto",
                    }}
                  >
                    YouTube
                  </h3>
                </div>
                <div className="text-center md:text-center lg:text-right">
                  <div className={`${isMobile ? 'text-2xl' : 'text-2xl md:text-5xl'} font-bold text-white drop-shadow-md`}>
                    <AnimatedCounter
                      target={12000000}
                      startScroll={isMobile ? windowHeight * 0.28 : windowHeight * 0.4}
                      currentScroll={scrollY}
                      suffix="+"
                      finalText="12 Million+"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Stats */}
              <div
                className="grid grid-cols-2 items-center gap-0 md:grid-cols-1 md:justify-center md:gap-1 lg:grid-cols-2 lg:gap-2"
                style={{
                  opacity: Math.max(0, Math.min(1, (scrollY - (isMobile ? windowHeight * 0.31 : windowHeight * 0.45)) / (windowHeight * 0.08))),
                }}
              >
                <div className="text-left md:text-center lg:text-left">
                  <h3
                    className={`${isMobile ? 'text-3xl' : 'text-3xl md:text-6xl'} font-bold text-white drop-shadow-md md:ml-0 lg:ml-0`}
                    style={{
                      position: "relative",
                      transform: "translateZ(0)",
                      willChange: "auto",
                    }}
                  >
                    Instagram
                  </h3>
                </div>
                <div className="text-center md:text-center lg:text-right">
                  <div className={`${isMobile ? 'text-2xl' : 'text-2xl md:text-5xl'} font-bold text-white drop-shadow-md`}>
                    <AnimatedCounter
                      target={25000000}
                      startScroll={isMobile ? windowHeight * 0.31 : windowHeight * 0.45}
                      currentScroll={scrollY}
                      suffix="+"
                      finalText="25 Million+"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section - Moved up significantly on mobile */}
          <section
            className={`relative flex items-center justify-center px-6 ${isMobile ? 'py-12 mt-4' : 'py-20 mt-8'}`}
            style={{
              opacity: contactOpacity,
              transform: `translateY(${contactTransform}px)`,
              transition: contactProgress >= 1 ? "none" : "opacity 0.3s ease-out, transform 0.3s ease-out",
            }}
          >
            <div className="w-full max-w-6xl mx-auto">
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-2 gap-12 md:gap-16'}`}>
                <EmailCopy email="contact@clutchtimeclips.com" label="Want to work with us?" />
                <EmailCopy email="support@clutchtimeclips.com" label="Have questions?" />
              </div>
            </div>
          </section>

          {/* Add bottom padding to prevent cut-off on mobile */}
          <div className={`${isMobile ? 'h-16' : 'h-32'}`}></div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .animate-bounce {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes scroll-infinite {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          .animate-scroll-infinite {
            animation: scroll-infinite 30s linear infinite;
          }

          .bg-gradient-radial {
            background: radial-gradient(circle, var(--tw-gradient-stops));
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-float-subtle {
            animation: float-subtle 3s ease-in-out infinite;
          }

          @keyframes float-subtle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes trophy-loop {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(2deg) scale(1.02); }
            50% { transform: rotate(0deg) scale(1.05); }
            75% { transform: rotate(-2deg) scale(1.02); }
            100% { transform: rotate(0deg) scale(1); }
          }

          .animate-trophy-loop {
            animation: trophy-loop 4s ease-in-out infinite alternate;
          }

          .w-96 { width: 24rem; }
          .h-96 { height: 24rem; }
          .w-128 { width: 32rem; }
          .h-128 { height: 32rem; }
          .w-144 { width: 36rem; }
          .h-144 { height: 36rem; }
          .w-160 { width: 40rem; }
          .h-160 { height: 40rem; }
          .w-192 { width: 48rem; }
          .h-192 { height: 48rem; }
          .w-224 { width: 56rem; }
          .h-224 { height: 56rem; }
        `}</style>
      </div>
    </TooltipProvider>
  )
}
