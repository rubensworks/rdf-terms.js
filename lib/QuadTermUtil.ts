import * as DataFactory from "@rdfjs/data-model";
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
  if (ignoreDefaultGraph && quad.graph.termType === 'DefaultGraph') {
    return [ quad.subject, quad.predicate, quad.object ];
  }
  return [ quad.subject, quad.predicate, quad.object, quad.graph ];
}

/**
 * Convert the given quad to an array of named terms.
 * This is the reverse operation of {@link collectNamedTerms}.
 * @param {Quad} quad An RDFJS quad.
 * @return {INamedTerm[]} An array of named terms.
 */
export function getNamedTerms(quad: RDF.Quad): INamedTerm[] {
  return [
    { key: 'subject',   value: quad.subject },
    { key: 'predicate', value: quad.predicate },
    { key: 'object',    value: quad.object },
    { key: 'graph',     value: quad.graph },
  ];
}

/**
 * Convert an array of named terms to an RDFJS quad.
 * This is the reverse operation of {@link getNamedTerms}.
 * @param {INamedTerm[]} namedTerms An array of named terms.
 * @param {(termName: QuadTermName) => Term} defaultCb An optional callback for when
 *                                                     certain terms are not available in the array.
 * @param {RDF.DataFactory} dataFactory A custom data factory to create quads.
 * @return {Quad} The resulting RDFJS quad.
 */
export function collectNamedTerms(namedTerms: INamedTerm[], defaultCb?: (termName: QuadTermName) => RDF.Term,
                                  dataFactory?: RDF.DataFactory): RDF.Quad {
  const elements: {[id: string]: RDF.Term} = {};
  namedTerms.forEach((namedTerm: INamedTerm) => elements[namedTerm.key] = namedTerm.value);
  if (defaultCb) {
    elements.subject   = elements.subject   || defaultCb('subject');
    elements.predicate = elements.predicate || defaultCb('predicate');
    elements.object    = elements.object    || defaultCb('object');
    elements.graph     = elements.graph     || defaultCb('graph');
  }
  return (dataFactory || DataFactory).quad(elements.subject, elements.predicate, elements.object, elements.graph);
}

/**
 * Iterats over each term.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} cb A callback function.
 */
export function forEachTerms(quad: RDF.Quad,
                             cb: (value: RDF.Term, key: QuadTermName) => void) {
  cb(quad.subject,   'subject');
  cb(quad.predicate, 'predicate');
  cb(quad.object,    'object');
  cb(quad.graph,     'graph');
}

/**
 * Get all terms in the given quad that return true on the given filter function.
 * @param {Quad} quad A quad.
 * @param {(value: Term, key: QuadTermName) => boolean} filter A filter callback.
 * @return {Term[]} The list of matching terms.
 */
export function filterTerms(quad: RDF.Quad, filter: (value: RDF.Term, key: QuadTermName) => boolean): RDF.Term[] {
  const terms: RDF.Term[] = [];
  if (filter(quad.subject, 'subject')) {
    terms.push(quad.subject);
  }
  if (filter(quad.predicate, 'predicate')) {
    terms.push(quad.predicate);
  }
  if (filter(quad.object, 'object')) {
    terms.push(quad.object);
  }
  if (filter(quad.graph, 'graph')) {
    terms.push(quad.graph);
  }
  return terms;
}

/**
 * Get all quad term names in the given quad that return true on the given filter function.
 * @param {Quad} quad A quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} filter A filter callback.
 * @return {QuadTermName[]} The list of matching quad term names.
 */
export function filterQuadTermNames(quad: RDF.Quad,
                                    filter: (value: RDF.Term, key: QuadTermName) => boolean): QuadTermName[] {
  const names: QuadTermName[] = [];
  if (filter(quad.subject, 'subject')) {
    names.push('subject');
  }
  if (filter(quad.predicate, 'predicate')) {
    names.push('predicate');
  }
  if (filter(quad.object, 'object')) {
    names.push('object');
  }
  if (filter(quad.graph, 'graph')) {
    names.push('graph');
  }
  return names;
}

/**
 * Map all terms of a quad.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName) => Term} mapper A mapper function.
 * @param {RDF.DataFactory} dataFactory A custom data factory to create quads.
 * @return {Quad} A new RDFJS quad.
 */
export function mapTerms(quad: RDF.Quad, mapper: (value: RDF.Term, key: QuadTermName) => RDF.Term,
                         dataFactory?: RDF.DataFactory): RDF.Quad {
  return (dataFactory || DataFactory).quad(
    mapper(quad.subject, 'subject'),
    mapper(quad.predicate, 'predicate'),
    mapper(quad.object, 'object'),
    mapper(quad.graph, 'graph'),
  );
}

/**
 * Reduce all terms of a quad.
 * @param {Quad} quad An RDFJS quad.
 * @param {(previousValue: U, currentValue: Term, key: QuadTermName) => U} reducer A reduce function.
 * @param {U} initialValue The initial value.
 * @return {U} The final value.
 */
export function reduceTerms<U>(quad: RDF.Quad,
                               reducer: (previousValue: U, currentValue: RDF.Term, key: QuadTermName) => U,
                               initialValue: U): U {
  let value: U = initialValue;
  value = reducer(value, quad.subject,   'subject');
  value = reducer(value, quad.predicate, 'predicate');
  value = reducer(value, quad.object,    'object');
  return  reducer(value, quad.graph,     'graph');
}

/**
 * Determines whether all terms satisfy the specified test.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} checker A checker function.
 * @return {boolean} If all terms satisfy the specified test.
 */
export function everyTerms(quad: RDF.Quad,
                           checker: (value: RDF.Term, key: QuadTermName) => boolean): boolean {
  return checker(quad.subject,   'subject')
      && checker(quad.predicate, 'predicate')
      && checker(quad.object,    'object')
      && checker(quad.graph,     'graph');
}

/**
 * Determines whether at least one term satisfies the specified test.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} checker A checker function.
 * @return {boolean} If at least one term satisfies the specified test.
 */
export function someTerms(quad: RDF.Quad,
                          checker: (value: RDF.Term, key: QuadTermName) => boolean): boolean {
  return checker(quad.subject,   'subject')
      || checker(quad.predicate, 'predicate')
      || checker(quad.object,    'object')
      || checker(quad.graph,     'graph');
}
