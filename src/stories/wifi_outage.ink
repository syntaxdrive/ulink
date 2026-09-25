// The Great WiFi Outage - An Interactive Campus Adventure
// Variables for tracking progress
VAR router_found = false
VAR crypto_stopped = false
VAR energy_drink = false
VAR password_known = false
VAR deji_stopped = false

VAR ada_respect = 0
VAR chad_respect = 0

// Fallback starting knot
-> map

=== map ===
// This shouldn't really be reached if the UI controls navigation,
// but acts as a fallback.
You are back outside on the UniLink campus. The WiFi is still dead.
-> DONE

// -----------------------------------------------------------------------------
// LIBRARY - Librarian Ada
// -----------------------------------------------------------------------------
=== library ===
{ router_found:
    Librarian Ada: Have you restored it yet? A freshman just asked me where the 'CTRL+F' button is on a physical book!
    You: I'm working on it!
    -> DONE
}

Librarian Ada: Shhhh! Do you hear that?
You: I don't hear anything.
Librarian Ada: Exactly! The WiFi is down and students are actually reading books. The silence is terrifying!
Librarian Ada: We need the WiFi back before they discover ancient, forbidden knowledge.
+ [Tell her to calm down]
    You: Miss Ada, breathe. Nobody is going to read—
    Librarian Ada: I saw an engineering student open an encyclopedia! It's happening!
    ~ ada_respect = ada_respect - 1
    -> router_mission
+ [Offer to help restore it]
    You: I can fix it. Where's the source of the outage?
    Librarian Ada: A brave soul. Or just a desperate TikTok addict. Either way, I'll take it.
    ~ ada_respect = ada_respect + 1
    -> router_mission
+ [Explore the books yourself]
    You: Maybe I should read a book while the WiFi is down...
    Librarian Ada: NO! You don't have the mental fortitude!
    # hp_-1
    (Ouch, her panic scream hurt your ears.)
    -> router_mission

= router_mission
Librarian Ada: The original campus connection was routed through the Ancient Router in the Restricted Section.
Librarian Ada: It hasn't been touched since 2003. Its capacitors are filled with the dust of early MySpace users.
Librarian Ada: I need you to retrieve it.
+ [Go to the Restricted Section] -> restricted_section

= restricted_section
You tiptoe past rows of dusty, unread textbooks. At the end, atop a pedestal of forgotten floppy disks, rests a glowing blue brick with two massive antennas.
+ [Pick it up carefully]
    You treat it with the respect an artifact deserves.
+ [Grab it and blow the dust off]
    You blow a massive cloud of dust into your own face.
    # hp_-1
    _Cough_ Worth it.

- You return to Ada with the router.
Librarian Ada: The Linksys WRT54G... It's beautiful.
{ ada_respect > 0:
    Librarian Ada: You are a true scholar. Now go. The signal is weak, you must find out what's draining the bandwidth elsewhere!
- else:
    Librarian Ada: Just don't drop it. Now get out there and find out who is draining our bandwidth!
}
~ router_found = true
# item_Ancient_Router
# xp_30
-> DONE

// -----------------------------------------------------------------------------
// LAB - Prof. Nakamoto
// -----------------------------------------------------------------------------
=== lab ===
{ not router_found:
    Prof. Nakamoto: Get out! The lab is closed for... uh, "maintenance"!
    (You should probably figure out the root of the WiFi issue at the Library first.)
    -> DONE
}

{ crypto_stopped:
    Prof. Nakamoto: *Crying softly into a motherboard* My beautiful Dogecoin...
    -> DONE
}

You enter the CS Lab. The temperature is roughly 110 degrees Fahrenheit. The hum of cooling fans is deafening.
Prof. Nakamoto is frantically adjusting liquid cooling pipes on a rig of 40 GPUs.
Prof. Nakamoto: Ah! A student! I am... uh... compiling the Linux kernel. Yes. For science.
+ [Call him out on the crypto mining]
    You: The screen literally says "Mining: 0.0003 DOGE".
    Prof. Nakamoto: It's an... anomaly in the matrix.
    -> confrontation
+ [Ask why it's so hot]
    You: Professor, there are literal flames coming out of PC #7.
    Prof. Nakamoto: That's thermal dynamics! Extra credit if you ignore it.
    -> confrontation
+ [Pretend to believe him]
    You: Wow, Linux compiling takes a lot of GPUs.
    Prof. Nakamoto: Exactly! Finally, a student who understands raw compute!
    -> confrontation

= confrontation
You: Professor, your rig is hogging the entire campus bandwidth. The WiFi is dead.
Prof. Nakamoto: So what?! Do you know how close I am to affording a premium coffee?!
Prof. Nakamoto: I won't shut it down. My blockchain army is invincible!
+ [Threaten to tell the Dean]
    You: The Dean might find it interesting that the university pays for your electricity...
    Prof. Nakamoto: You wouldn't! The paperwork alone would ruin me!
    -> surrender
+ [Pull the power cord] -> unplug_it

= unplug_it
You lunge for the main power breaker. Nakamoto leaps to stop you!
Prof. Nakamoto: My precious hashes! NO!
You have to fight him off!
# trigger_combat_prof
(You shoved him away and pulled the plug. The deafening fans groan to a halt.)
-> surrender

= surrender
Prof. Nakamoto: You've ruined me. I was going to the moon...
You: You saved 3% of the campus bandwidth. You should be thanking me.
~ crypto_stopped = true
# item_Crypto_Evidence
# xp_35
You: Though the WiFi still isn't fully back. Something else is wrong.
Prof. Nakamoto: Check the cafeteria... I heard Mama B hoarding bandwidth for her smart-pots...
-> DONE

// -----------------------------------------------------------------------------
// CAFETERIA - Chef Mama B
// -----------------------------------------------------------------------------
=== cafeteria ===
{ not crypto_stopped:
    Chef Mama B: Kitchen is closed! The smart oven requires WiFi to bake cookies. Ridiculous!
    (You should probably check the CS Lab before looking for snacks.)
    -> DONE
}

{ energy_drink:
    Chef Mama B: You still here? Go restore the internet before my smart-fridge defrosts the meat!
    -> DONE
}

Chef Mama B is stirring a massive pot of jollof rice. The aroma is heavenly.
Chef Mama B: Welcome! You want food? WiFi? Both are broken today!
Chef Mama B: But I know who broke the WiFi. Cost you one compliment about my jollof rice.
+ [Compliment honestly]
    You: It smells genuinely amazing.
    Chef Mama B: Smells?! Taste it!
    # hp_1
    (You try it. It's fantastic.)
    -> get_drink
+ [Flatter her excessively]
    You: Your jollof rice is... better than Ghanaian jollof?
    Chef Mama B: *Tears of joy* A STUDENT OF CULTURE! Take this!
    -> get_drink
+ [Insult the rice (Dangerous)]
    You: It smells a bit burnt...
    Chef Mama B: BURNT?! Disrespectful child!
    # hp_-1
    (She whacks you softly but firmly with a wooden spoon.)
    You: Okay, okay! I'm sorry! It's great!
    -> get_drink

= get_drink
Chef Mama B: The WiFi killer is in the GYM. Some boy who bench-presses routers. Chad, I think.
Chef Mama B: Here, take this. You'll need the energy to deal with him.
~ energy_drink = true
# item_Monster_Energy
# xp_20
(You received a dubious-looking energy drink. 400mg of caffeine. Your hands are already shaking.)
-> DONE

// -----------------------------------------------------------------------------
// GYM - Chad Thunderlift
// -----------------------------------------------------------------------------
=== gym ===
{ not energy_drink:
    Chad Thunderlift: BRO. Can't you see I'm resting between sets? Come back when you're swole.
    (You feel too weak to confront him. Maybe the Cafeteria has something...)
    -> DONE
}

{ password_known:
    Chad Thunderlift: Keep grinding, bro. ChadLifts225 is a lifestyle.
    -> DONE
}

Chad Thunderlift is doing bicep curls in the squat rack. He notices you staring.
Chad Thunderlift: BRO. The WiFi password is now my bench PR: 225lbs.
Chad Thunderlift: I changed it in the main router settings. Pure alpha move.
+ [Ask for the password nicely]
    You: Can I just have the password, please?
    Chad Thunderlift: Respect is earned, bro. Not given.
    ~ chad_respect = chad_respect - 1
    -> challenge
+ [Drink the Monster Energy and get hyped]
    (You chug the 400mg of caffeine. Time slows down. You can hear colors.)
    You: Chad! Give me the password or I will drink your pre-workout!
    Chad Thunderlift: A fellow beast! I respect that energy!
    ~ chad_respect = chad_respect + 2
    -> challenge
+ [Insult his form]
    You: You're using too much momentum on those curls, bro.
    Chad Thunderlift: UNFORGIVABLE.
    # hp_-1
    (He flexes so hard the shockwave physically hurts you.)
    -> challenge

= challenge
Chad Thunderlift: You want the password? Beat me in a push-up contest. Or don't. Your loss.
You: I can do like... 3 push-ups. On a good day. With gravity assist.
Chad Thunderlift: LOL. Fine. Just fight the procrastination monsters I summoned to guard the router. Same thing.
+ [Fight the monsters]
    # trigger_combat_gym
    (You easily dispatched the spectral distractions Chad called "monsters".)
    -> victory

= victory
Chad Thunderlift: BRO. You actually did it. Respect.
{ chad_respect > 0:
    Chad Thunderlift: You're an absolute unit. We should hit legs tomorrow.
- else:
    Chad Thunderlift: I mean, you lack form, but you have heart.
}
Chad Thunderlift: The password is ChadLifts225.
You: You could have just texted me this...
Chad Thunderlift: Where's the character development in that, bro?
~ password_known = true
# item_WiFi_Password
# xp_50
You: But wait... I have the router, I stopped the crypto miner, I have the password... why is it still so slow?!
Chad Thunderlift: Bro, check your roommate Deji. Dude's been torrenting the entire internet since Tuesday.
-> DONE

// -----------------------------------------------------------------------------
// DORM - Roommate Deji (Final Boss)
// -----------------------------------------------------------------------------
=== dorm ===
{ not password_known:
    Roommate Deji: *Muffled anime noises from behind the door*
    (You should probably secure the WiFi password from the Gym before coming back here.)
    -> DONE
}

{ deji_stopped:
    Roommate Deji: I'm just reading the manga now. WiFi is all yours, champ.
    -> DONE
}

You kick open the door to your dorm. Deji is surrounded by 17 glowing monitors.
He is downloading EVERY anime in existence simultaneously in 4K.
Roommate Deji: Oh hey. WiFi's slow?
+ [Yell at him]
    You: Deji! You're downloading the ENTIRE Crunchyroll library! The whole campus is offline!
    Roommate Deji: I'm on episode 847 of One Piece. I CAN'T pause now. If I stop, I lose the momentum!
    -> final_showdown
+ [Try to reason]
    You: Buddy, the campus needs internet to... study.
    Roommate Deji: Studying is temporary. The Grand Line is eternal.
    -> final_showdown

= final_showdown
You: Stop the torrents or I'll trip the room's power breaker!
Roommate Deji: You wouldn't dare! My uninterrupted uptime is 400 hours!
Roommate Deji: If you want my bandwidth, you'll have to get past my ultimate defense!
# trigger_combat_boss
(You furiously mash the keyboard, terminating torrent after torrent until the network icon turns solid green.)
-> conclusion

= conclusion
Roommate Deji: *Sighs heavily* Fine. Happy? I paused them. I'll just read the manga.
You plug in the Ancient Router. You enter the password 'ChadLifts225'. The connection establishes.
Your phone dings with 4,000 missed notifications.
# item_Campus_Hero_Badge
# xp_100
~ deji_stopped = true
🎉 WIFI RESTORED! The campus cheers! Birds are singing! GPAs are rising!
You truly are the hero UniLink needed.
-> DONE
