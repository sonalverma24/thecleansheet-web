import {expect,it} from 'vitest';
import {makeReview} from './review.fixtures';
import {reconcileMissingIngredients,MISSING_INCI_MESSAGE} from './review-ingredient-state';
it('removes contradictory full-INCI assertions and formula prose when no list was retained',()=>{
 const old=makeReview({inciIngredients:[],ingredientReads:[]});
 const result=reconcileMissingIngredients(old);
 expect(result.ingredientTransparency.fullInciAvailable).toBe(false);
 expect(result.ingredientTransparency.inciSource).toBe('Not verified');
 expect(result.verdict.cleanSheetTakeaway).toBe(MISSING_INCI_MESSAGE);
 expect(result.consumerSuitability.bestFor).toEqual([]);
 expect(old.ingredientTransparency.fullInciAvailable).toBe(true);
});
it('preserves analyses that have a retained list',()=>{const r=makeReview();expect(reconcileMissingIngredients(r)).toBe(r);});
