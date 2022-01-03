import * as RDF from "@rdfjs/types";
import { termToString } from 'rdf-string';

/**
 * All known term types.
 * @see RDF.Term
 * @type {[string , string , string , string , string, string]}
 */
export const TERM_TYPES = [ 'NamedNode', 'BlankNode', 'Literal', 'Variable', 'DefaultGraph', 'Quad' ];

/*
 * Utility methods for handling RDFJS terms.
 */

/**
 * Create an array of unique terms from the given array.
 * @param {T[]} terms An array of RDFJS terms.
 * @return {T[]} A new array of unique RDFJS terms.
 */
export function uniqTerms<T extends RDF.Term>(terms: T[]): T[] {
  const hash: Record<string, boolean> = {};

  return terms.filter(term => {
    const termString = termToString<RDF.Term>(term);
    return !(termString in hash) && (hash[termString] = true);
  })
}

/**
 * Find all terms of the given type in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @param {"NamedNode" | "BlankNode" | "Literal" | "Variable" | "DefaultGraph" | "Quad"} termType A term type.
 * @return {Term[]} A new array with elements from the given array only containing elements of the given type.
 */
export function getTermsOfType(terms: RDF.Term[],
                               termType: "NamedNode" | "BlankNode" | "Literal" | "Variable" | "DefaultGraph" | "Quad")
: RDF.Term[] {
  return terms.filter((term: RDF.Term) => term.termType === termType);
}

/**
 * Find all named nodes in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @return {NamedNode[]} A new array with elements from the given array only containing named nodes.
 */
export function getNamedNodes(terms: RDF.Term[]): RDF.NamedNode[] {
  return <RDF.NamedNode[]> getTermsOfType(terms, 'NamedNode');
}

/**
 * Find all blank nodes in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @return {BlankNode[]} A new array with elements from the given array only containing blank nodes.
 */
export function getBlankNodes(terms: RDF.Term[]): RDF.BlankNode[] {
  return <RDF.BlankNode[]> getTermsOfType(terms, 'BlankNode');
}

/**
 * Find all literals in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @return {Literal[]} A new array with elements from the given array only containing literals.
 */
export function getLiterals(terms: RDF.Term[]): RDF.Literal[] {
  return <RDF.Literal[]> getTermsOfType(terms, 'Literal');
}

/**
 * Find all variables in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @return {Variable[]} A new array with elements from the given array only containing variables.
 */
export function getVariables(terms: RDF.Term[]): RDF.Variable[] {
  return <RDF.Variable[]> getTermsOfType(terms, 'Variable');
}

/**
 * Find all default graphs in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @return {DefaultGraph[]} A new array with elements from the given array only containing default graphs.
 */
export function getDefaultGraphs(terms: RDF.Term[]): RDF.DefaultGraph[] {
  return <RDF.DefaultGraph[]> getTermsOfType(terms, 'DefaultGraph');
}

/**
 * Find all quads in the given array.
 * @param {Term[]} terms An array of RDFJS terms.
 * @return {BaseQuad[]} A new array with elements from the given array only containing quads.
 */
export function getQuads(terms: RDF.Term[]): RDF.BaseQuad[] {
  return <RDF.BaseQuad[]> getTermsOfType(terms, 'Quad');
}
