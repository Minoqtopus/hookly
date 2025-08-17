import { NextRequest, NextResponse } from 'next/server';

// Demo rate limiting - 1 per day per IP
const demoAttempts = new Map<string, number>();

// Demo templates for consistent experience
const demoTemplates = {
  'beauty': {
    hook: "I was skeptical about this skincare routine until I saw the results after just 7 days...",
    script: "So I've been struggling with my skin for YEARS. Nothing worked - expensive creams, dermatologist visits, you name it.\n\nThen my friend recommended this 3-step routine and I was like 'here we go again' 🙄\n\nBut guys... LOOK AT THIS transformation! This is just 7 days apart.\n\nStep 1: Gentle cleanser that doesn't strip your skin\nStep 2: This serum that's packed with vitamin C\nStep 3: Moisturizer that actually hydrates without feeling greasy\n\nI'm not even wearing makeup in the second photo! My skin is literally glowing.\n\nThe best part? The whole routine costs less than one fancy cream I used to buy.\n\nLink in bio if you want to try it - but honestly, I'm just so happy I had to share this with you guys! ✨",
    visuals: [
      "Close-up before/after side-by-side comparison",
      "You applying each step of the routine",
      "Product shots with good lighting",
      "Your genuine reaction looking in the mirror",
      "Natural lighting selfie showing the glow"
    ],
    performance: { estimatedViews: 125000, estimatedCTR: 4.2, viralScore: 8.3 }
  },
  'fitness': {
    hook: "This 5-minute morning routine changed my entire body in 30 days...",
    script: "Okay so I used to be the person who hit snooze 5 times and rushed out the door with no energy ☕\n\nThen I discovered this 5-minute morning routine that literally transformed my body AND my mindset.\n\nHere's what I do every single morning:\n\n1. 30-second plank (builds core strength)\n2. 20 squats (activates those glutes)\n3. 1-minute wall sit (leg power!)\n4. 30 push-ups (upper body gains)\n5. 1-minute stretching (flexibility)\n\nThat's it! 5 minutes.\n\nAfter 30 days, I have more energy, my clothes fit better, and I actually LOOK FORWARD to mornings now.\n\nThe crazy part? I'm not even going to the gym. This is just in my bedroom.\n\nIf you're tired of feeling tired, try this for one week. I promise you'll feel the difference.\n\nComment 'ENERGY' and I'll send you the full routine breakdown! 💪",
    visuals: [
      "Time-lapse of the 5-minute routine",
      "Before/after body transformation (30 days apart)",
      "You doing each exercise with proper form",
      "Morning energy comparison (tired vs energized)",
      "Bedroom setup showing minimal space needed"
    ],
    performance: { estimatedViews: 89000, estimatedCTR: 3.8, viralScore: 7.9 }
  },
  'tech': {
    hook: "This $30 gadget just saved me from buying a $2000 laptop...",
    script: "So my laptop was dying and I was about to drop $2000 on a new MacBook 💸\n\nThen I found this little gadget that basically turned my old laptop into a BEAST.\n\nIt's called a laptop cooling pad and here's why it's genius:\n\n✅ Dropped my CPU temperature by 20 degrees\n✅ My laptop stopped overheating during video calls\n✅ Games actually run smoothly now\n✅ No more random shutdowns\n✅ Extended my laptop's life by probably 2-3 years\n\nI was literally about to throw this laptop away and now it runs like it's brand new.\n\nFor $30 vs $2000... this was a no-brainer.\n\nThe best part? It's portable, USB-powered, and works with any laptop.\n\nIf your laptop gets hot, makes weird noises, or runs slow - try this before buying a new one.\n\nLink in bio! Your wallet will thank you later 🔥",
    visuals: [
      "Temperature comparison (before/after with thermal readings)",
      "Side-by-side speed test demonstration",
      "The cooling pad in action with your laptop",
      "Your reaction to improved performance",
      "Portability demonstration (packing it up)"
    ],
    performance: { estimatedViews: 67000, estimatedCTR: 5.1, viralScore: 8.1 }
  }
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastAttempt = demoAttempts.get(ip) || 0;
  const oneDay = 24 * 60 * 60 * 1000;
  
  return (now - lastAttempt) < oneDay;
}

function recordAttempt(ip: string): void {
  demoAttempts.set(ip, Date.now());
  
  // Clean up old entries every day
  if (demoAttempts.size > 1000) {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    Array.from(demoAttempts.entries()).forEach(([key, value]) => {
      if (now - value > oneDay) {
        demoAttempts.delete(key);
      }
    });
  }
}

function selectTemplate(productName: string, niche: string, targetAudience: string) {
  const input = `${productName} ${niche} ${targetAudience}`.toLowerCase();
  
  // Simple keyword matching for demo
  if (input.includes('beauty') || input.includes('skin') || input.includes('makeup') || input.includes('cream')) {
    return demoTemplates.beauty;
  }
  
  if (input.includes('fitness') || input.includes('workout') || input.includes('exercise') || input.includes('gym')) {
    return demoTemplates.fitness;
  }
  
  if (input.includes('tech') || input.includes('gadget') || input.includes('device') || input.includes('laptop')) {
    return demoTemplates.tech;
  }
  
  // Default to beauty template with some customization
  return {
    ...demoTemplates.beauty,
    hook: `I was skeptical about ${productName} until I saw the results...`,
    script: demoTemplates.beauty.script.replace('skincare routine', productName.toLowerCase()),
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          message: 'Demo limit reached. You can try the demo once per day. Start your free trial for 15 generations with no waiting!',
          upgradeMessage: 'Start your free trial to generate 15 ads immediately with no daily limits.'
        },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { productName, niche, targetAudience } = body;
    
    // Validate input
    if (!productName || !niche || !targetAudience) {
      return NextResponse.json(
        { message: 'Missing required fields: productName, niche, and targetAudience are required' },
        { status: 400 }
      );
    }
    
    // Record the attempt
    recordAttempt(ip);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Select appropriate template
    const template = selectTemplate(productName, niche, targetAudience);
    
    // Add some randomization to make it feel more dynamic
    const performanceVariation = Math.random() * 0.2 - 0.1; // ±10%
    const result = {
      ...template,
      performance: {
        estimatedViews: Math.round(template.performance.estimatedViews * (1 + performanceVariation)),
        estimatedCTR: Number((template.performance.estimatedCTR * (1 + performanceVariation)).toFixed(1)),
        viralScore: Number(Math.min(10, Math.max(1, template.performance.viralScore * (1 + performanceVariation))).toFixed(1))
      },
      generatedAt: new Date().toISOString(),
      isDemo: true
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Demo generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate demo ad. Please try again.' },
      { status: 500 }
    );
  }
}