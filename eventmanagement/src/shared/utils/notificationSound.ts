export class NotificationSound {
  private static audioContext: AudioContext | null = null
  private static isEnabled = true

  // Initialize audio context
  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  // Play a simple beep sound
  static playBeep(frequency = 800, duration = 200, volume = 0.1): void {
    if (!this.isEnabled) return

    try {
      const audioContext = this.getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }

  // Play notification sound from audio file
  static async playNotificationSound(audioFile = '/notification.mp3', volume = 0.5): Promise<void> {
    if (!this.isEnabled) return

    try {
      console.log(`🔊 Attempting to play: ${audioFile}`)
      const audio = new Audio(audioFile)
      audio.volume = volume
      
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve)
        audio.addEventListener('error', reject)
        audio.load()
      })
      
      await audio.play()
      console.log(`✅ Successfully played: ${audioFile}`)
    } catch (error) {
      console.warn(`❌ Could not play notification sound (${audioFile}):`, error)
      // Fallback to beep
      this.playBeep()
    }
  }

  // Play a multi-tone sequence
  private static playSequence(frequencies: number[], durations: number[], volume = 0.1): void {
    if (!this.isEnabled) return

    let currentTime = 0
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, durations[index] || 150, volume)
      }, currentTime)
      currentTime += (durations[index] || 150) + 50 // Add small gap between tones
    })
  }

  // Different sounds for different notification types
  static playNotificationByType(type: string): void {
    switch (type.toLowerCase()) {
      // Event-related sounds
      case 'event_created':
      case 'event_creation':
        // Try to play custom sound first, fallback to generated tones
        this.playNotificationSound('/notificationSounds/event-created.mp3', 0.6)
          .catch(() => {
            // Fallback: Ascending tone sequence for creation (positive)
            this.playSequence([600, 750, 900], [120, 120, 200], 0.12)
          })
        break
    
      case 'event_deleted':
      case 'event_deletion':
        this.playNotificationSound('/notificationSounds/event-deleted.mp3', 0.6)
          .catch(() => {
            // Fallback: Descending tone sequence for deletion (negative)
            this.playSequence([800, 600, 400], [100, 100, 200], 0.1)
          })
        break

      // Registration-related sounds
      case 'registration_confirmed':
      case 'registration':
        this.playNotificationSound('/notificationSounds/registration-confirmed.mp3', 0.6)
          .catch(() => {
            // Fallback: Double beep for registration confirmation
            this.playSequence([650, 850], [150, 200], 0.15)
          })
        break
      
      case 'registration_cancelled':
      case 'registration_cancellation':
      case 'cancelled':
        this.playNotificationSound('/notificationSounds/registration-cancelled.mp3', 0.6)
          .catch(() => {
            // Fallback: Single low tone for cancellation
            this.playBeep(400, 250, 0.12)
          })
        break

      // Other notification types
      case 'event_reminder':
        this.playNotificationSound('/notificationSounds/event-reminder.mp3', 0.5)
          .catch(() => {
            this.playBeep(800, 150, 0.12) // Quick high tone
          })
        break
      
      case 'capacity_alert':
        this.playNotificationSound('/notificationSounds/capacity-alert.mp3', 0.7)
          .catch(() => {
            // Fallback: Urgent triple beep
            this.playSequence([1000, 1000, 1000], [80, 80, 80], 0.08)
          })
        break

      default:
        this.playNotificationSound('/notificationSounds/default.mp3', 0.5)
          .catch(() => {
            this.playBeep() // Default sound
          })
    }
  }

  // Enable/disable sounds
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  static isAudioEnabled(): boolean {
    return this.isEnabled
  }

  // Test different notification sounds (useful for debugging/previewing)
  static testSounds(): void {
    console.log('Testing notification sounds...')
    
    setTimeout(() => {
      console.log('Event Created')
      this.playNotificationByType('event_created')
    }, 0)
    
    setTimeout(() => {
      console.log('Event Deleted')
      this.playNotificationByType('event_deleted')
    }, 2000)
    
    setTimeout(() => {
      console.log('Registration Confirmed')
      this.playNotificationByType('registration')
    }, 4000)
    
    setTimeout(() => {
      console.log('Registration Cancelled')
      this.playNotificationByType('registration_cancelled')
    }, 6000)
  }

  // Add this method for debugging
  static async testAudioFiles(): Promise<void> {
    console.log('Testing audio file accessibility...')
    
    const files = [
      '/notificationSounds/VineBoom.mp3',
      '/notificationSounds/AmongUsImpostorSoundEffect.mp3'
    ]
    
    for (const file of files) {
      try {
        console.log(`Testing: ${file}`)
        const audio = new Audio(file)
        audio.volume = 0.3
        
        // Test if file loads
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            console.log(`✅ ${file} loaded successfully`)
            resolve(true)
          })
          audio.addEventListener('error', (e) => {
            console.error(`❌ ${file} failed to load:`, e)
            reject(e)
          })
          audio.load()
        })
        
        // Try to play
        await audio.play()
        console.log(`🔊 ${file} played successfully`)
        
        // Stop after 1 second
        setTimeout(() => {
          audio.pause()
          audio.currentTime = 0
        }, 1000)
        
      } catch (error) {
        console.error(`❌ Error with ${file}:`, error)
      }
    }
  }

  // Add this simple test method
  static async testDirectAccess(): Promise<void> {
    console.log('🔍 Testing direct file access...')
    
    const files = [
      '/notificationSounds/VineBoom.mp3',
      '/notificationSounds/AmongUsImpostorSoundEffect.mp3'
    ]
    
    for (const file of files) {
      try {
        const response = await fetch(file)
        if (response.ok) {
          console.log(`✅ ${file} is accessible (${response.status})`)
        } else {
          console.error(`❌ ${file} not found (${response.status})`)
        }
      } catch (error) {
        console.error(`❌ ${file} fetch failed:`, error)
      }
    }
  }

  // Simplified test without promises
  static testSimpleAudio(): void {
    console.log('🔍 Testing simple audio...')
    
    try {
      const audio = new Audio('/notificationSounds/VineBoom.mp3')
      audio.volume = 0.5
      
      audio.addEventListener('loadstart', () => console.log('🔄 Load started'))
      audio.addEventListener('loadeddata', () => console.log('✅ Data loaded'))
      audio.addEventListener('canplay', () => console.log('✅ Can play'))
      audio.addEventListener('error', (e) => console.error('❌ Audio error:', e))
      
      audio.load()
      
      // Try to play after a short delay
      setTimeout(() => {
        audio.play()
          .then(() => console.log('🔊 Playing'))
          .catch(err => console.error('❌ Play failed:', err))
      }, 1000)
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
}