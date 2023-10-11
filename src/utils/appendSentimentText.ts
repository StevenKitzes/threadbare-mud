import { ClassTypes, SceneSentiment } from "../types";

export function appendSentimentText(job: string, sentiment: SceneSentiment, actorText: string[]): void {
  if (sentiment === SceneSentiment.remote) return;

  switch (job) {
    case ClassTypes.peacemaker:
      switch (sentiment) {
        case SceneSentiment.favorPeacemakers:
          actorText.push("Folk nod in reverence to your Peacemaker lineage as they pass.");
          break;
        case SceneSentiment.favorRangers:
          actorText.push("The people here look upon your Peacemaker lineage with skeptical curiosity.");
          break;
        case SceneSentiment.favorRogues:
          actorText.push("People in this place sneer at your ashen Peacemaker complexion, but likely only because they don't know what it is.");
          break;
        case SceneSentiment.favorSkyguard:
          actorText.push("The folk here mostly ignore you; you are a Peacemaker and not one of them.");
          break;
        case SceneSentiment.favorSpymasters:
          actorText.push("You get a lot of sidelong glances here, as people try to figure out what to make of your Peacemaker lineage.");
          break;
        case SceneSentiment.favorWeavers:
          actorText.push("Folk nod in reverence to your Peacemaker lineage as they pass.");
          break;
        case SceneSentiment.neutral:
          actorText.push("You get a lot of sidelong glances here, as people try to figure out what to make of your Peacemaker lineage.");
          break;
      }
      break;

    case ClassTypes.ranger:
      switch (sentiment) {
        case SceneSentiment.favorPeacemakers:
          actorText.push("People here treat you with absentminded respect, but at least it is respect.");
          break;
        case SceneSentiment.favorRangers:
          actorText.push("Those who carry themselves like rangers can spot each other a mile off, and you get subtle nods of camaraderie here.");
          break;
        case SceneSentiment.favorRogues:
          actorText.push("The denizens of this place mostly ignore you.");
          break;
        case SceneSentiment.favorSkyguard:
          actorText.push("You are ignored, regarded as a common human here.");
          break;
        case SceneSentiment.favorSpymasters:
          actorText.push("You are mostly ignored here, though you occasionally catch someone's eyes lingering on you for a little too long.");
          break;
        case SceneSentiment.favorWeavers:
          actorText.push("The folk here recognize your ranger's bearing and look upon you with respect.");
          break;
        case SceneSentiment.neutral:
          actorText.push("You are ignored, regarded as a common human here.");
          break;
      }
      break;

    case ClassTypes.rogue:
      switch (sentiment) {
        case SceneSentiment.favorPeacemakers:
          actorText.push("People here treat you with absentminded respect, but at least it is respect.");
          break;
        case SceneSentiment.favorRangers:
          actorText.push("The people here look upon you with skeptical curiosity.");
          break;
        case SceneSentiment.favorRogues:
          actorText.push("The occasional subtle gesture or shady wink lets you know you are in good company.");
          break;
        case SceneSentiment.favorSkyguard:
          actorText.push("You are ignored, regarded as a common human here.");
          break;
        case SceneSentiment.favorSpymasters:
          actorText.push("You are uncomfortable with how long folks' eyes linger on you here.");
          break;
        case SceneSentiment.favorWeavers:
          actorText.push("You are uncomfortable with how long folks' eyes linger on you here.");
          break;
        case SceneSentiment.neutral:
          actorText.push("You are ignored, regarded as a common human here.");
          break;
      }
      break;

    case ClassTypes.skyguard:
      switch (sentiment) {
        case SceneSentiment.favorPeacemakers:
          actorText.push("Folk here look like they want to spit on your Skyguard lineage with disgust.");
          break;
        case SceneSentiment.favorRangers:
          actorText.push("The people here look uncomfortable having a Skyguard around.");
          break;
        case SceneSentiment.favorRogues:
          actorText.push("The people here look upon you with cautious skepticism.");
          break;
        case SceneSentiment.favorSkyguard:
          actorText.push("Everyone here seems ready to meet a Skyguard with warm greetings.");
          break;
        case SceneSentiment.favorSpymasters:
          actorText.push("A lot of eyes linger on you for a long time, unduly focused on your Skyguard lineage.");
          break;
        case SceneSentiment.favorWeavers:
          actorText.push("Your Skyguard lineage draws many disdainful glances in this place.");
          break;
        case SceneSentiment.neutral:
          actorText.push("The folk here look on your Skyguard lineage with a mix of fear, awe, and curiosity.");
          break;
      }
      break;

    case ClassTypes.spymaster:
      switch (sentiment) {
        case SceneSentiment.favorPeacemakers:
          actorText.push("The fools here treat you with absentminded respect, but at least it is respect.");
          break;
        case SceneSentiment.favorRangers:
          actorText.push("You are ignored, regarded as a common human by the fools here.");
          break;
        case SceneSentiment.favorRogues:
          actorText.push("The people here look upon you with healthy skepticism.");
          break;
        case SceneSentiment.favorSkyguard:
          actorText.push("You are ignored, regarded as a common human by the fools here.");
          break;
        case SceneSentiment.favorSpymasters:
          actorText.push("Everyone here knows better than to let on what they think of you.");
          break;
        case SceneSentiment.favorWeavers:
          actorText.push("Some people's eyes linger on you here, more curious than cautious.");
          break;
        case SceneSentiment.neutral:
          actorText.push("You are ignored, regarded as a common human by the fools here.");
          break;
      }
      break;

    case ClassTypes.weaver:
      switch (sentiment) {
        case SceneSentiment.favorPeacemakers:
          actorText.push("The folk here smile warmly seeing a Weaver in their midst.");
          break;
        case SceneSentiment.favorRangers:
          actorText.push("The people here nod or smile at you with respect.");
          break;
        case SceneSentiment.favorRogues:
          actorText.push("People here are trying to pretend they're not staring at you.");
          break;
        case SceneSentiment.favorSkyguard:
          actorText.push("Some here seem to ignore you, while others appear cautiously skeptical at a Weaver's presence.");
          break;
        case SceneSentiment.favorSpymasters:
          actorText.push("Most here seem to ignore you, though you can tell some are only pretending not to pay attention.");
          break;
        case SceneSentiment.favorWeavers:
          actorText.push("All look upon you with warm respect in this place.");
          break;
        case SceneSentiment.neutral:
          actorText.push("Folk in this place rarely know what to make of you, and gaze on with curiosity.");
          break;
      }
      break;
  }
}

export default appendSentimentText;
