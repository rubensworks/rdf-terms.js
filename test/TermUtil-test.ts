import {blankNode, defaultGraph, literal, namedNode, quad, triple, variable} from "rdf-data-model";
import * as RDF from "rdf-js";
import * as TermUtil from "../lib/TermUtil";

describe('TermUtil', () => {

  const empty: RDF.Term[] = [];
  const single: RDF.Term[] = [
    namedNode('a'),
  ];
  const double: RDF.Term[] = [
    namedNode('a'),
    namedNode('b'),
  ];
  const doubleEq: RDF.Term[] = [
    namedNode('a'),
    namedNode('a'),
  ];
  const equalValueMixedTypes: RDF.Term[] = [
    namedNode('a'),
    variable('a'),
    blankNode('a'),
    literal('a'),
    defaultGraph(),
  ];
  const equalValueMixedTypesDuplicates: RDF.Term[] = [
    variable('a'),
    namedNode('a'),
    variable('a'),
    literal('a'),
    defaultGraph(),
    blankNode('a'),
    namedNode('a'),
    literal('a'),
    defaultGraph(),
    blankNode('a'),
  ];

  describe('#uniqTerms', () => {
    it('should uniqify the empty array', async () => {
      return expect(TermUtil.uniqTerms(empty)).toEqual([]);
    });

    it('should uniqify an array with one element', async () => {
      return expect(TermUtil.uniqTerms(single)).toEqual(single);
    });

    it('should uniqify an array with two non-equal element', async () => {
      return expect(TermUtil.uniqTerms(double))
        .toEqual(double);
    });

    it('should uniqify an array with two equal element', async () => {
      return expect(TermUtil.uniqTerms(doubleEq))
        .toEqual([namedNode('a')]);
    });

    it('should uniqify an array with two equal and one other element', async () => {
      return expect(TermUtil.uniqTerms([namedNode('a'), namedNode('b'), namedNode('a')]))
        .toEqual([namedNode('a'), namedNode('b')]);
    });

    it('should uniqify an array with mixed element types', async () => {
      return expect(TermUtil.uniqTerms(equalValueMixedTypesDuplicates))
        .toEqual([
          variable('a'),
          namedNode('a'),
          literal('a'),
          defaultGraph(),
          blankNode('a'),
        ]);
    });
  });

  describe('#getTermsOfType', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getTermsOfType(empty, 'NamedNode')).toEqual([]);
    });

    it('should find named nodes', async () => {
      expect(TermUtil.getTermsOfType(single, 'NamedNode')).toEqual(single);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'NamedNode')).toEqual([namedNode('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'NamedNode'))
        .toEqual([namedNode('a'), namedNode('a')]);
    });

    it('should find blank nodes', async () => {
      expect(TermUtil.getTermsOfType(single, 'BlankNode')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'BlankNode')).toEqual([blankNode('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'BlankNode'))
        .toEqual([blankNode('a'), blankNode('a')]);
    });

    it('should find literals', async () => {
      expect(TermUtil.getTermsOfType(single, 'Literal')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'Literal')).toEqual([literal('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'Literal'))
        .toEqual([literal('a'), literal('a')]);
    });

    it('should find variables', async () => {
      expect(TermUtil.getTermsOfType(single, 'Variable')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'Variable')).toEqual([variable('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'Variable'))
        .toEqual([variable('a'), variable('a')]);
    });

    it('should find default graphs', async () => {
      expect(TermUtil.getTermsOfType(single, 'DefaultGraph')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'DefaultGraph')).toEqual([defaultGraph()]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'DefaultGraph'))
        .toEqual([defaultGraph(), defaultGraph()]);
    });
  });

  describe('#getNamedNodes', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getNamedNodes(empty)).toEqual([]);
    });

    it('should find named nodes', async () => {
      expect(TermUtil.getNamedNodes(single)).toEqual(single);
      expect(TermUtil.getNamedNodes(equalValueMixedTypes)).toEqual([namedNode('a')]);
      expect(TermUtil.getNamedNodes(equalValueMixedTypesDuplicates))
        .toEqual([namedNode('a'), namedNode('a')]);
    });
  });

  describe('#getBlankNodes', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getNamedNodes(empty)).toEqual([]);
    });

    it('should find blank nodes', async () => {
      expect(TermUtil.getBlankNodes(single)).toEqual([]);
      expect(TermUtil.getBlankNodes(equalValueMixedTypes)).toEqual([blankNode('a')]);
      expect(TermUtil.getBlankNodes(equalValueMixedTypesDuplicates))
        .toEqual([blankNode('a'), blankNode('a')]);
    });
  });

  describe('#getLiterals', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getLiterals(empty)).toEqual([]);
    });

    it('should find literals', async () => {
      expect(TermUtil.getLiterals(single)).toEqual([]);
      expect(TermUtil.getLiterals(equalValueMixedTypes)).toEqual([literal('a')]);
      expect(TermUtil.getLiterals(equalValueMixedTypesDuplicates))
        .toEqual([literal('a'), literal('a')]);
    });
  });

  describe('#getVariables', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getVariables(empty)).toEqual([]);
    });

    it('should find variables', async () => {
      expect(TermUtil.getVariables(single)).toEqual([]);
      expect(TermUtil.getVariables(equalValueMixedTypes)).toEqual([variable('a')]);
      expect(TermUtil.getVariables(equalValueMixedTypesDuplicates))
        .toEqual([variable('a'), variable('a')]);
    });

    it('should find default graphs', async () => {
      expect(TermUtil.getDefaultGraphs(single)).toEqual([]);
      expect(TermUtil.getDefaultGraphs(equalValueMixedTypes)).toEqual([defaultGraph()]);
      expect(TermUtil.getDefaultGraphs(equalValueMixedTypesDuplicates))
        .toEqual([defaultGraph(), defaultGraph()]);
    });
  });
});
