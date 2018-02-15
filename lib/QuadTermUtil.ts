import * as DataFactory from "rdf-data-model";
import * as RDF from "rdf-js";

/*
 * Utility methods for handling terms in RDFJS quads.
 */

/**
 * The possible quad term entries in an RDFJS quad.
 */
export type QuadTermName = 'subject' | 'predicate' | 'object' | 'graph';

/**
 * All available quad term names.
 * @type {[string , string , string , string]}
 */
export const QUAD_TERM_NAMES: QuadTermName[] = ['subject', 'predicate', 'object', 'graph'];

/**
 * All available triple term names.
 * @type {[string , string , string]}
 */
export const TRIPLE_TERM_NAMES: QuadTermName[] = ['subject', 'predicate', 'object'];

/**
 * An RDFJS term with a quad term name key.
 */
export interface INamedTerm {
  /**
   * A quad term name.
   */
  key: QuadTermName;
  /**
   * An RDFJS term.
   */
  value: RDF.Term;
}

/**
 * Get all terms in the given quad.
 * @param {Quad} quad An RDFJS quad.
 * @param {boolean} ignoreDefaultGraph If true and the quad has the default graph as graph,
 *                                     this term will not be returned in the array.
 *                                     (default: false)
 * @return {Term[]} The available terms in the quad.
 */
export function getTerms(quad: RDF.Quad, ignoreDefaultGraph?: boolean): RDF.Term[] {
  const terms: RDF.Term[] = QUAD_TERM_NAMES.map((key: string) => (<any> quad)[key]);
  if (ignoreDefaultGraph && terms[3].termType === 'DefaultGraph') {
    terms.splice(3, 1);
  }
  return terms;
}

/**
 * Convert the given quad to an array of named terms.
 * This is the reverse operation of {@link collectNamedTerms}.
 * @param {Quad} quad An RDFJS quad.
 * @return {INamedTerm[]} An array of named terms.
 */
export function getNamedTerms(quad: RDF.Quad): INamedTerm[] {
  return QUAD_TERM_NAMES.map((key: QuadTermName) => ({ key, value: (<any> quad)[key] }));
}

/**
 * Convert an array of named terms to an RDFJS quad.
 * This is the reverse operation of {@link getNamedTerms}.
 * @param {INamedTerm[]} namedTerms An array of named terms.
 * @param {(termName: QuadTermName) => Term} defaultCb An optional callback for when
 *                                                     certain terms are not available in the array.
 * @return {Quad} The resulting RDFJS quad.
 */
export function collectNamedTerms(namedTerms: INamedTerm[], defaultCb?: (termName: QuadTermName) => RDF.Term)
: RDF.Quad {
  const elements: {[id: string]: RDF.Term} = {};
  namedTerms.forEach((namedTerm: INamedTerm) => elements[namedTerm.key] = namedTerm.value);
  if (defaultCb) {
    QUAD_TERM_NAMES.forEach((termName: QuadTermName) => {
      if (!elements[termName]) {
        elements[termName] = defaultCb(termName);
      }
    });
  }
  return DataFactory.quad(elements.subject, elements.predicate, elements.object, elements.graph);
}

/**
 * Iterats over each term.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => void} cb A callback function.
 */
export function forEachTerms(quad: RDF.Quad,
                             cb: (value: RDF.Term, key: QuadTermName, all: INamedTerm[]) => void) {
  return getNamedTerms(quad)
    .forEach((namedTerm: INamedTerm, i: number, all: INamedTerm[]) =>
      cb(namedTerm.value, namedTerm.key, all));
}

/**
 * Get all terms in the given quad that return true on the given filter function.
 * @param {Quad} quad A quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} filter A filter callback.
 * @return {Term[]} The list of matching terms.
 */
export function filterTerms(quad: RDF.Quad, filter: (value: RDF.Term, key: QuadTermName, all: INamedTerm[]) => boolean)
: RDF.Term[] {
  return getNamedTerms(quad)
    .filter((namedTerm: INamedTerm, i: number, all: INamedTerm[]) =>
      filter(namedTerm.value, namedTerm.key, all))
    .map((namedTerm: INamedTerm) => namedTerm.value);
}

/**
 * Get all quad term names in the given quad that return true on the given filter function.
 * @param {Quad} quad A quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} filter A filter callback.
 * @return {QuadTermName[]} The list of matching quad term names.
 */
export function filterQuadTermNames(quad: RDF.Quad,
                                    filter: (value: RDF.Term, key: QuadTermName, all: INamedTerm[]) => boolean)
: QuadTermName[] {
  return getNamedTerms(quad)
    .filter((namedTerm: INamedTerm, i: number, all: INamedTerm[]) =>
      filter(namedTerm.value, namedTerm.key, all))
    .map((namedTerm: INamedTerm) => namedTerm.key);
}

/**
 * Map all terms of a quad.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName) => Term} mapper A mapper function.
 * @return {Quad} A new RDFJS quad.
 */
export function mapTerms(quad: RDF.Quad, mapper: (value: RDF.Term, key: QuadTermName) => RDF.Term)
: RDF.Quad {
  return DataFactory.quad(
    mapper(quad.subject, 'subject'),
    mapper(quad.predicate, 'predicate'),
    mapper(quad.object, 'object'),
    mapper(quad.graph, 'graph'),
  );
}

/**
 * Reduce all terms of a quad.
 * @param {Quad} quad An RDFJS quad.
 * @param {(previousValue: U, currentValue: Term, key: QuadTermName, all: INamedTerm[]) => U} reducer A reduce function.
 * @param {U} initialValue The initial value.
 * @return {U} The final value.
 */
export function reduceTerms<U>(quad: RDF.Quad,
                               reducer: (previousValue: U, currentValue: RDF.Term, key: QuadTermName,
                                         all: INamedTerm[]) => U,
                               initialValue: U): U {
  return getNamedTerms(quad)
    .reduce((previousValue: U, namedTerm: INamedTerm, i: number, all: INamedTerm[]) =>
      reducer(previousValue, namedTerm.value, namedTerm.key, all), initialValue);
}

/**
 * Determines whether all terms satisfy the specified test.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} checker A checker function.
 * @return {boolean} If all terms satisfy the specified test.
 */
export function everyTerms(quad: RDF.Quad,
                           checker: (value: RDF.Term, key: QuadTermName, all: INamedTerm[]) => boolean): boolean {
  return getNamedTerms(quad)
    .every((namedTerm: INamedTerm, i: number, all: INamedTerm[]) =>
      checker(namedTerm.value, namedTerm.key, all));
}

/**
 * Determines whether at least one term satisfies the specified test.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} checker A checker function.
 * @return {boolean} If at least one term satisfies the specified test.
 */
export function someTerms(quad: RDF.Quad,
                          checker: (value: RDF.Term, key: QuadTermName, all: INamedTerm[]) => boolean): boolean {
  return getNamedTerms(quad)
    .some((namedTerm: INamedTerm, i: number, all: INamedTerm[]) =>
      checker(namedTerm.value, namedTerm.key, all));
}
