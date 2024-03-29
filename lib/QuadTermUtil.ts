import { DataFactory } from "rdf-data-factory";
import * as RDF from "@rdfjs/types";

const DF = new DataFactory();

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
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {boolean} ignoreDefaultGraph If true and the quad has the default graph as graph,
 *                                     this term will not be returned in the array.
 *                                     (default: false)
 * @return {Term[]} The available terms in the quad.
 */
export function getTerms(quad: RDF.BaseQuad, ignoreDefaultGraph?: boolean): RDF.Term[] {
  if (ignoreDefaultGraph && quad.graph.termType === 'DefaultGraph') {
    return [ quad.subject, quad.predicate, quad.object ];
  }
  return [ quad.subject, quad.predicate, quad.object, quad.graph ];
}

/**
 * Get all terms in the given quad, including nested quads.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {boolean} ignoreDefaultGraph If true and the quad has the default graph as graph,
 *                                     this term will not be returned in the array.
 *                                     (default: false)
 * @return {Term[]} The available terms in the nested quad, excluding quad terms.
 */
export function getTermsNested(quad: RDF.BaseQuad, ignoreDefaultGraph?: boolean): RDF.Term[] {
  const terms: RDF.Term[] = [];
  for (const term of getTerms(quad, ignoreDefaultGraph)) {
    if (term.termType === 'Quad') {
      getTermsNested(term, ignoreDefaultGraph).forEach(subTerm => terms.push(subTerm));
    } else {
      terms.push(term);
    }
  }
  return terms;
}

/**
 * Convert the given quad to an array of named terms.
 * This is the reverse operation of {@link collectNamedTerms}.
 * @param {BaseQuad} quad An RDFJS quad.
 * @return {INamedTerm[]} An array of named terms.
 */
export function getNamedTerms(quad: RDF.BaseQuad): INamedTerm[] {
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
 * @return {Q} The resulting RDFJS quad.
 * @template Q The type of quad to output, defaults to RDF.Quad.
 */
export function collectNamedTerms<Q extends RDF.BaseQuad = RDF.Quad>(
  namedTerms: INamedTerm[], defaultCb?: (termName: QuadTermName) => RDF.Term, dataFactory?: RDF.DataFactory<Q>): Q {
  const elements: {[id: string]: RDF.Term} = {};
  namedTerms.forEach((namedTerm: INamedTerm) => elements[namedTerm.key] = namedTerm.value);
  if (defaultCb) {
    elements.subject   = elements.subject   || defaultCb('subject');
    elements.predicate = elements.predicate || defaultCb('predicate');
    elements.object    = elements.object    || defaultCb('object');
    elements.graph     = elements.graph     || defaultCb('graph');
  }
  return (dataFactory || <RDF.DataFactory<Q>> <any> DF).quad(
    elements.subject, elements.predicate, elements.object, elements.graph);
}

/**
 * Iterates over each term.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} cb A callback function.
 */
export function forEachTerms(quad: RDF.BaseQuad,
                             cb: (value: RDF.Term, key: QuadTermName) => void) {
  cb(quad.subject,   'subject');
  cb(quad.predicate, 'predicate');
  cb(quad.object,    'object');
  cb(quad.graph,     'graph');
}

/**
 * Iterates over each leaf term, while recursing into quoted triples.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} cb A callback function.
 * @param QuadTermName[] keys The current key path.
 */
export function forEachTermsNested(quad: RDF.BaseQuad,
                                   cb: (value: RDF.Term, keys: QuadTermName[]) => void,
                                   keys: QuadTermName[] = []) {
  if (quad.subject.termType === 'Quad') {
    forEachTermsNested(quad.subject, cb, [ ...keys, 'subject' ]);
  } else {
    cb(quad.subject,   [ ...keys, 'subject' ]);
  }
  if (quad.predicate.termType === 'Quad') {
    forEachTermsNested(quad.predicate, cb, [ ...keys, 'predicate' ]);
  } else {
    cb(quad.predicate,   [ ...keys, 'predicate' ]);
  }
  if (quad.object.termType === 'Quad') {
    forEachTermsNested(quad.object, cb, [ ...keys, 'object' ]);
  } else {
    cb(quad.object,   [ ...keys, 'object' ]);
  }
  if (quad.graph.termType === 'Quad') {
    forEachTermsNested(quad.graph, cb, [ ...keys, 'graph' ]);
  } else {
    cb(quad.graph,   [ ...keys, 'graph' ]);
  }
}

/**
 * Get all terms in the given quad that return true on the given filter function.
 * @param {BaseQuad} quad A quad.
 * @param {(value: Term, key: QuadTermName) => boolean} filter A filter callback.
 * @return {Term[]} The list of matching terms.
 */
export function filterTerms(quad: RDF.BaseQuad, filter: (value: RDF.Term, key: QuadTermName) => boolean): RDF.Term[] {
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
 * Get all terms in the given quad that return true on the given filter function, while recursing into quoted triples.
 * @param {BaseQuad} quad A quad.
 * @param {(value: Term, key: QuadTermName) => boolean} filter A filter callback.
 * @param QuadTermName[] keys The current key path.
 * @return {Term[]} The list of matching terms.
 */
export function filterTermsNested(quad: RDF.BaseQuad, filter: (value: RDF.Term, keys: QuadTermName[]) => boolean,
                                  keys: QuadTermName[] = []): RDF.Term[] {
  let terms: RDF.Term[] = [];
  if (quad.subject.termType === 'Quad') {
    terms = [ ...terms, ...filterTermsNested(quad.subject, filter, [ ...keys, 'subject' ]) ];
  } else {
    if (filter(quad.subject, [ ...keys, 'subject' ])) {
      terms.push(quad.subject);
    }
  }
  if (quad.predicate.termType === 'Quad') {
    terms = [ ...terms, ...filterTermsNested(quad.predicate, filter, [ ...keys, 'predicate' ]) ];
  } else {
    if (filter(quad.predicate, [ ...keys, 'predicate' ])) {
      terms.push(quad.predicate);
    }
  }
  if (quad.object.termType === 'Quad') {
    terms = [ ...terms, ...filterTermsNested(quad.object, filter, [ ...keys, 'object' ]) ];
  } else {
    if (filter(quad.object, [...keys, 'object'])) {
      terms.push(quad.object);
    }
  }
  if (quad.graph.termType === 'Quad') {
    terms = [ ...terms, ...filterTermsNested(quad.graph, filter, [ ...keys, 'graph' ]) ];
  } else {
    if (filter(quad.graph, [...keys, 'graph'])) {
      terms.push(quad.graph);
    }
  }
  return terms;
}

/**
 * Get all quad term names in the given quad that return true on the given filter function.
 * @param {BaseQuad} quad A quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} filter A filter callback.
 * @return {QuadTermName[]} The list of matching quad term names.
 */
export function filterQuadTermNames(quad: RDF.BaseQuad,
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
 * Get all quad term names in the given quad that return true on the given filter function, while recursing into quoted triples.
 * @param {BaseQuad} quad A quad.
 * @param {(value: Term, key: QuadTermName, all: INamedTerm[]) => boolean} filter A filter callback.
 * @param QuadTermName[] keys The current key path.
 * @return {QuadTermName[]} The list of matching quad term names.
 */
export function filterQuadTermNamesNested(quad: RDF.BaseQuad,
                                          filter: (value: RDF.Term, keys: QuadTermName[]) => boolean,
                                          keys: QuadTermName[] = []): QuadTermName[][] {
  let names: QuadTermName[][] = [];
  const keysS: QuadTermName[] = [ ...keys, 'subject' ];
  if (quad.subject.termType === 'Quad') {
    names = [ ...names, ...filterQuadTermNamesNested(quad.subject, filter, keysS) ];
  } else {
    if (filter(quad.subject, keysS)) {
      names.push(keysS);
    }
  }
  const keysP: QuadTermName[] = [ ...keys, 'predicate' ];
  if (quad.predicate.termType === 'Quad') {
    names = [ ...names, ...filterQuadTermNamesNested(quad.predicate, filter, keysP) ];
  } else {
    if (filter(quad.predicate, keysP)) {
      names.push(keysP);
    }
  }
  const keysO: QuadTermName[] = [ ...keys, 'object' ];
  if (quad.object.termType === 'Quad') {
    names = [ ...names, ...filterQuadTermNamesNested(quad.object, filter, keysO) ];
  } else {
    if (filter(quad.object, keysO)) {
      names.push(keysO);
    }
  }
  const keysG: QuadTermName[] = [ ...keys, 'graph' ];
  if (quad.graph.termType === 'Quad') {
    names = [ ...names, ...filterQuadTermNamesNested(quad.graph, filter, keysG) ];
  } else {
    if (filter(quad.graph, keysG)) {
      names.push(keysG);
    }
  }
  return names;
}

/**
 * Map all terms of a quad.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName) => Term} mapper A mapper function.
 * @param {RDF.DataFactory} dataFactory A custom data factory to create quads.
 * @return {Quad} A new RDFJS quad.
 * @template Q The type of quad, defaults to RDF.Quad.
 */
export function mapTerms<Q extends RDF.BaseQuad = RDF.Quad>(quad: Q,
                                                            mapper: (term: RDF.Term, key: QuadTermName) => RDF.Term,
                                                            dataFactory?: RDF.DataFactory<Q>): Q {
  return (dataFactory || <RDF.DataFactory<Q>> <any> DF).quad(
    mapper(quad.subject, 'subject'),
    mapper(quad.predicate, 'predicate'),
    mapper(quad.object, 'object'),
    mapper(quad.graph, 'graph'),
  );
}

/**
 * Map all terms of a quad, while recursing into quoted triples.
 * @param {Quad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName) => Term} mapper A mapper function.
 * @param {RDF.DataFactory} dataFactory A custom data factory to create quads.
 * @param QuadTermName[] keys The current key path.
 * @return {Quad} A new RDFJS quad.
 * @template Q The type of quad, defaults to RDF.Quad.
 */
export function mapTermsNested<Q extends RDF.BaseQuad = RDF.Quad>(quad: Q,
                                                                  mapper: (term: RDF.Term, keys: QuadTermName[]) => RDF.Term,
                                                                  dataFactory?: RDF.DataFactory<Q>,
                                                                  keys: QuadTermName[] = []): Q {
  return (dataFactory || <RDF.DataFactory<Q>> <any> DF).quad(
    quad.subject.termType === 'Quad' ?
      mapTermsNested(quad.subject, mapper, dataFactory, [ ...keys, 'subject' ]) :
      mapper(quad.subject, [ ...keys, 'subject' ]),
    quad.predicate.termType === 'Quad' ?
      mapTermsNested(quad.predicate, mapper, dataFactory, [ ...keys, 'predicate' ]) :
      mapper(quad.predicate, [ ...keys, 'predicate' ]),
    quad.object.termType === 'Quad' ?
      mapTermsNested(quad.object, mapper, dataFactory, [ ...keys, 'object' ]) :
      mapper(quad.object, [ ...keys, 'object' ]),
    quad.graph.termType === 'Quad' ?
      mapTermsNested(quad.graph, mapper, dataFactory, [ ...keys, 'graph' ]) :
      mapper(quad.graph, [ ...keys, 'graph' ]),
  );
}

/**
 * Reduce all terms of a quad.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(previousValue: U, currentValue: Term, key: QuadTermName) => U} reducer A reduce function.
 * @param {U} initialValue The initial value.
 * @return {U} The final value.
 */
export function reduceTerms<U>(quad: RDF.BaseQuad,
                               reducer: (previousValue: U, currentValue: RDF.Term, key: QuadTermName) => U,
                               initialValue: U): U {
  let value: U = initialValue;
  value = reducer(value, quad.subject,   'subject');
  value = reducer(value, quad.predicate, 'predicate');
  value = reducer(value, quad.object,    'object');
  return  reducer(value, quad.graph,     'graph');
}

/**
 * Reduce all terms of a quad, while recursing into quoted triples.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(previousValue: U, currentValue: Term, key: QuadTermName) => U} reducer A reduce function.
 * @param {U} initialValue The initial value.
 * @param QuadTermName[] keys The current key path.
 * @return {U} The final value.
 */
export function reduceTermsNested<U>(quad: RDF.BaseQuad,
                                     reducer: (previousValue: U, currentValue: RDF.Term, keys: QuadTermName[]) => U,
                                     initialValue: U,
                                     keys: QuadTermName[] = []): U {
  let value: U = initialValue;
  if (quad.subject.termType === 'Quad') {
    value = reduceTermsNested(quad.subject, reducer, value, [ ...keys, 'subject' ]);
  } else {
    value = reducer(value, quad.subject,   [ ...keys, 'subject' ]);
  }
  if (quad.predicate.termType === 'Quad') {
    value = reduceTermsNested(quad.predicate, reducer, value, [ ...keys, 'predicate' ]);
  } else {
    value = reducer(value, quad.predicate,   [ ...keys, 'predicate' ]);
  }
  if (quad.object.termType === 'Quad') {
    value = reduceTermsNested(quad.object, reducer, value, [ ...keys, 'object' ]);
  } else {
    value = reducer(value, quad.object,   [ ...keys, 'object' ]);
  }
  if (quad.graph.termType === 'Quad') {
    value = reduceTermsNested(quad.graph, reducer, value, [ ...keys, 'graph' ]);
  } else {
    value = reducer(value, quad.graph,   [ ...keys, 'graph' ]);
  }
  return value;
}

/**
 * Determines whether all terms satisfy the specified test.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} checker A checker function.
 * @return {boolean} If all terms satisfy the specified test.
 */
export function everyTerms(quad: RDF.BaseQuad,
                           checker: (value: RDF.Term, key: QuadTermName) => boolean): boolean {
  return checker(quad.subject,   'subject')
      && checker(quad.predicate, 'predicate')
      && checker(quad.object,    'object')
      && checker(quad.graph,     'graph');
}

/**
 * Determines whether all terms satisfy the specified test, while recursing into quoted triples.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} checker A checker function.
 * @param QuadTermName[] keys The current key path.
 * @return {boolean} If all terms satisfy the specified test.
 */
export function everyTermsNested(quad: RDF.BaseQuad,
                                 checker: (value: RDF.Term, keys: QuadTermName[]) => boolean,
                                 keys: QuadTermName[] = []): boolean {
  return (quad.subject.termType === 'Quad' ?
    everyTermsNested(quad.subject, checker, [ ...keys, 'subject' ]) :
    checker(quad.subject, [ ...keys, 'subject' ]))
    && (quad.predicate.termType === 'Quad' ?
      everyTermsNested(quad.predicate, checker, [ ...keys, 'predicate' ]) :
      checker(quad.predicate, [ ...keys, 'predicate' ]))
    && (quad.object.termType === 'Quad' ?
      everyTermsNested(quad.object, checker, [ ...keys, 'object' ]) :
      checker(quad.object, [ ...keys, 'object' ]))
    && (quad.graph.termType === 'Quad' ?
      everyTermsNested(quad.graph, checker, [ ...keys, 'graph' ]) :
      checker(quad.graph, [ ...keys, 'graph' ]))
}

/**
 * Determines whether at least one term satisfies the specified test.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} checker A checker function.
 * @return {boolean} If at least one term satisfies the specified test.
 */
export function someTerms(quad: RDF.BaseQuad,
                          checker: (value: RDF.Term, key: QuadTermName) => boolean): boolean {
  return checker(quad.subject,   'subject')
      || checker(quad.predicate, 'predicate')
      || checker(quad.object,    'object')
      || checker(quad.graph,     'graph');
}

/**
 * Determines whether at least one term satisfies the specified test, while recursing into quoted triples.
 * @param {BaseQuad} quad An RDFJS quad.
 * @param {(value: Term, key: QuadTermName} checker A checker function.
 * @param QuadTermName[] keys The current key path.
 * @return {boolean} If at least one term satisfies the specified test.
 */
export function someTermsNested(quad: RDF.BaseQuad,
                                checker: (value: RDF.Term, keys: QuadTermName[]) => boolean,
                                keys: QuadTermName[] = []): boolean {
  return (quad.subject.termType === 'Quad' ?
      someTermsNested(quad.subject, checker, [ ...keys, 'subject' ]) :
      checker(quad.subject,   [ ...keys, 'subject' ]))
    || (quad.predicate.termType === 'Quad' ?
      someTermsNested(quad.predicate, checker, [ ...keys, 'predicate' ]) :
      checker(quad.predicate,   [ ...keys, 'predicate' ]))
    || (quad.object.termType === 'Quad' ?
      someTermsNested(quad.object, checker, [ ...keys, 'object' ]) :
      checker(quad.object,   [ ...keys, 'object' ]))
    || (quad.graph.termType === 'Quad' ?
      someTermsNested(quad.graph, checker, [ ...keys, 'graph' ]) :
      checker(quad.graph,   [ ...keys, 'graph' ]));
}

/**
 * Get the nested value inside a quoted triple by the given path of quad keys.
 * @param term A term, that can be a quoted triple.
 * @param keys A path of quad term names.
 */
export function getValueNestedPath(term: RDF.Term, keys: QuadTermName[]): RDF.Term {
  if (keys.length === 0) {
    return term;
  }
  if (term.termType === 'Quad') {
    return getValueNestedPath(term[keys[0]], keys.slice(1));
  }
  throw new Error(`Tried to get ${keys[0]} from term of type ${term.termType}`);
}

/**
 * Check if the given terms match.
 *
 * At least one of the following must be true:
 * * Term B is undefined.
 * * Term B is a variable.
 * * Term A and B are quads, and return true for `matchPatternComplete`.
 * * Quad term and term are equal (`termB.equals(termA)` return true)
 *
 * @param termA A term.
 * @param termB An optional term.
 */
export function matchTerm(termA: RDF.Term, termB?: RDF.Term) {
  return !termB
    || termB.termType === 'Variable'
    || (termB.termType === 'Quad' && termA.termType === 'Quad' && matchPatternComplete(termA, termB))
    || termB.equals(termA);
}

/**
 * Check if the given quad matches with the given quad terms.
 *
 * Each term must match at least one of the following:
 * * Term is undefined.
 * * Term is a variable.
 * * Quad term and term are both quads, and return true for `matchPatternComplete`.
 * * Quad term and term are equal (`quadTerm.equals(term)` return true)
 *
 * @param {BaseQuad} quad A quad to match with (can not contain variables).
 * @param {Term} subject An optional subject.
 * @param {Term} predicate An optional predicate.
 * @param {Term} object An optional object.
 * @param {Term} graph An optional graph.
 * @return {boolean} If the quad matches with the quad terms.
 */
export function matchPattern(quad: RDF.BaseQuad, subject?: RDF.Term, predicate?: RDF.Term,
                             object?: RDF.Term, graph?: RDF.Term): boolean {
  return matchTerm(quad.subject, subject)
    && matchTerm(quad.predicate, predicate)
    && matchTerm(quad.object, object)
    && matchTerm(quad.graph, graph);
}

/**
 * Check if the first quad matches with all terms from the second quad.
 *
 * Each term must match at least one of the following:
 * * Quad2 term is a variable.
 * * Quad1 term and Quad2 term are equal (`term1.equals(term2)` return true)
 *
 * @param {BaseQuad} quad A quad (can not contain variables).
 * @param {BaseQuad} pattern A quad pattern (can contain variables).
 * @return {boolean} If the quad terms match.
 */
export function matchPatternComplete(quad: RDF.BaseQuad, pattern: RDF.BaseQuad): boolean {
  return matchPattern(quad, pattern.subject, pattern.predicate, pattern.object, pattern.graph);
}

/**
 * Check if the first quad matches against all terms in the pattern,
 * by taking into account the mappings of the variables.
 * If the same variable occurs multiple times in the pattern,
 * then the corresponding terms in the quad must be equal.
 *
 * Each term in the quad must satisfy the following:
 * * The pattern term is a variable, and all other variables with the same value - map to the same terms in the quad
 * * Both the quad term and pattern term are quads - and they satisfy the same conditions
 * * The pattern and quad terms are equal and not variables or quads
 *
 * @param quad A quad - possibly containing variables
 * @param pattern A pattern - possibly containing variables
 * @param options
 *    skipVarMapping - don't add variables in the quad to the mapping
 *    returnMappings - return the mappings if it is a valid match
 */
export function matchPatternMappings(quad: RDF.BaseQuad, pattern: RDF.BaseQuad): boolean;
export function matchPatternMappings(quad: RDF.BaseQuad, pattern: RDF.BaseQuad, opt: { skipVarMapping?: boolean; returnMappings?: false }): boolean;
export function matchPatternMappings(quad: RDF.BaseQuad, pattern: RDF.BaseQuad, opt: { skipVarMapping?: boolean; returnMappings: true }): false | Record<string, RDF.Term>;
export function matchPatternMappings(quad: RDF.BaseQuad, pattern: RDF.BaseQuad, opt: PatternOptions = {}): boolean | Record<string, RDF.Term> {
  const map: Record<string, RDF.Term> = {};
  function match(_pattern: RDF.BaseQuad, _quad: RDF.BaseQuad): boolean {
    return everyTerms(_pattern, (t1, key) => {
      const t2 = _quad[key];
      switch (t1.termType) {
      case 'Variable':
        return (opt.skipVarMapping && t2.termType === 'Variable')
          || (map[t1.value]?.equals(t2) ?? (map[t1.value] = t2, true));
      case 'Quad':
        return t2.termType === 'Quad' && match(t1, t2);
      default:
        return t1.equals(t2);
      }
    });
  }
  return match(pattern, quad) && (opt.returnMappings ? map : true);
}

interface PatternOptions {
  skipVarMapping?: boolean;
  returnMappings?: boolean;
}
