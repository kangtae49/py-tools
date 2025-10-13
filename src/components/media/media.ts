import type {Sub} from "@/types/models";
import {commands} from "@/bindings.ts";

export const getSrcSub = async (sub: Sub) => {
  const result = await commands.readSub(sub.fullpath);
  let vttText = '';
  if (result.status === 'ok') {
    vttText = result.data;
  }
  const blob = new Blob([vttText], { type: "text/vtt" });
  return URL.createObjectURL(blob);
}

export const getSubs = async (subs: Sub[]) => {

  let newSubs: Sub[] = [];
  for (const sub of subs) {
    try{
      const newSub = {...sub};
      newSub.src = await getSrcSub(sub);
      newSubs.push(newSub);
    } catch (e) {
      console.error('loadVtt', e);
    }
  }
  return newSubs;
}