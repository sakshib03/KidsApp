import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.isLoaded = false;
    this.userPaused=false;
  }

  async loadAndPlay() {
    try {
      if (!this.isLoaded) {
        console.log("Loading background sound for the first time...");
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/audio/game-music-loop.mp3")
        );
        this.sound = sound;
        this.isLoaded = true;
        
        await this.sound.setIsLoopingAsync(true);
      }

      if (!this.isPlaying && !this.userPaused) {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log("Background sound started playing");
      }
    } catch (error) {
      console.error("Error in loadAndPlay:", error);
    }
  }
 

  async pause() {
    if (this.sound && this.isPlaying) {
      await this.sound.pauseAsync();
      this.isPlaying = false;
      this.userPaused = true;
      console.log("Sound paused");
    }
  }

  async resume() {
    if (this.sound && !this.isPlaying) {
      await this.sound.playAsync();
      this.isPlaying = true;
      this.userPaused = false;
      console.log("Sound resumed");
    }
  }

  async toggle() {
    if (this.isPlaying) {
      await this.pause();
    } else {
      await this.resume();
    }
  }

  async unload() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.isLoaded = false;
      this.isPlaying = false;
      this.userPaused = false;
      console.log("Sound unloaded");
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  resetPauseState() {
    this.userPaused = false;
  }
}

export const soundManager = new SoundManager();