function updatePetEmotion() {
        checkAndApplySickness(); // เรียกใช้เพื่อให้ state.pet.sickness อัปเดตเสมอ
		if (!state.pet.exists) return;

        let newEmotion = 'normal';
        let isBubbleVisible = false;
        let bubbleText = '';

        // --- โค้ดที่แก้ไข ---
        // เปลี่ยนมาใช้การตรวจสอบแบบลำดับขั้น เพื่อให้แน่ใจว่าสถานะป่วยจะถูกแสดงก่อนเสมอ
        
        // 1. ตรวจสอบสถานะป่วยที่รุนแรงที่สุด (ขาดสารอาหาร)
        if (state.pet.hunger <= 0 && state.pet.happiness <= 0) {
            newEmotion = 'malnutrition';
            isBubbleVisible = true;
            bubbleText = 'ไม่มีแรงแล้ว... เป็นความผิดของเราเอง';
        } 
        // 2. ตรวจสอบโรคกระเพาะ (หิว = 0)
        else if (state.pet.hunger <= 0) {
            newEmotion = 'gastritis';
            isBubbleVisible = true;
            bubbleText = 'ปวดท้องจัง...';
        } 
        // 3. ตรวจสอบโรคซึมเศร้า (ความสุข = 0)
        else if (state.pet.happiness <= 0) {
            newEmotion = 'depression';
            isBubbleVisible = true;
            bubbleText = 'ไม่อยากทำอะไรเลย...';
        } 
        // 4. หากไม่ป่วย จึงตรวจสอบอารมณ์ทั่วไป (ค่าพลังอยู่ระหว่าง 1-50)
        else if ((state.pet.hunger > 0 && state.pet.hunger <= 50) || (state.pet.happiness > 0 && state.pet.happiness <= 50)) {
            isBubbleVisible = true;
            if (state.pet.hunger <= state.pet.happiness) {
                newEmotion = 'sad';
                bubbleText = 'หิวแน้ววว';
            } else {
                newEmotion = 'angry';
                bubbleText = 'ไม่คิดถึงกันหรอ';
            }
        }
        // --- สิ้นสุดโค้ดที่แก้ไข ---

        if (newEmotion !== currentPetEmotion) {
            currentPetEmotion = newEmotion;

            if (idleAnimationInterval) {
                clearInterval(idleAnimationInterval);
                idleAnimationInterval = null;
            }

            petSpeechBubble.textContent = bubbleText;
            petSpeechBubble.classList.toggle('hidden', !isBubbleVisible);

            if (currentPetEmotion === 'normal') {
                const setRandomIdle = () => {
                    const idleAnimations = petEmotions.normal;
                    if (!idleAnimations || idleAnimations.length === 0) return;
                    const randomIndex = Math.floor(Math.random() * idleAnimations.length);
                    const imageUrl = idleAnimations[randomIndex];
                    
                    if (!floatingPetImage.src.endsWith(imageUrl)) {
                        floatingPetImage.src = imageUrl;
                        petModalImageEl.src = imageUrl;
                    }
                };
                setRandomIdle();
                idleAnimationInterval = setInterval(setRandomIdle, Math.random() * 5000 + 5000);
            } else {
                const imageUrl = petEmotions[currentPetEmotion];
                if (imageUrl && !floatingPetImage.src.endsWith(imageUrl)) {
                    floatingPetImage.src = imageUrl;
                    petModalImageEl.src = imageUrl;
                }
            }
        }
    }
