import { DataFactory } from "rdf-data-factory";
import * as RDF from "rdf-js";
import * as TermUtil from "../lib/TermUtil";

const DF = new DataFactory();

describe('TermUtil', () => {

  const empty: RDF.Term[] = [];
  const single: RDF.Term[] = [
    DF.namedNode('a'),
  ];
  const double: RDF.Term[] = [
    DF.namedNode('a'),
    DF.namedNode('b'),
  ];
  const doubleEq: RDF.Term[] = [
    DF.namedNode('a'),
    DF.namedNode('a'),
  ];
  const equalValueMixedTypes: RDF.Term[] = [
    DF.namedNode('a'),
    DF.variable('a'),
    DF.blankNode('a'),
    DF.literal('a'),
    DF.defaultGraph(),
  ];
  const equalValueMixedTypesDuplicates: RDF.Term[] = [
    DF.variable('a'),
    DF.namedNode('a'),
    DF.variable('a'),
    DF.literal('a'),
    DF.defaultGraph(),
    DF.blankNode('a'),
    DF.namedNode('a'),
    DF.literal('a'),
    DF.defaultGraph(),
    DF.blankNode('a'),
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
        .toEqual([DF.namedNode('a')]);
    });

    it('should uniqify an array with two equal and one other element', async () => {
      return expect(TermUtil.uniqTerms([DF.namedNode('a'), DF.namedNode('b'), DF.namedNode('a')]))
        .toEqual([DF.namedNode('a'), DF.namedNode('b')]);
    });

    it('should uniqify an array with mixed element types', async () => {
      return expect(TermUtil.uniqTerms(equalValueMixedTypesDuplicates))
        .toEqual([
          DF.variable('a'),
          DF.namedNode('a'),
          DF.literal('a'),
          DF.defaultGraph(),
          DF.blankNode('a'),
        ]);
    });
  });

  describe('#getTermsOfType', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getTermsOfType(empty, 'NamedNode')).toEqual([]);
    });

    it('should find named nodes', async () => {
      expect(TermUtil.getTermsOfType(single, 'NamedNode')).toEqual(single);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'NamedNode')).toEqual([DF.namedNode('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'NamedNode'))
        .toEqual([DF.namedNode('a'), DF.namedNode('a')]);
    });

    it('should find blank nodes', async () => {
      expect(TermUtil.getTermsOfType(single, 'BlankNode')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'BlankNode')).toEqual([DF.blankNode('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'BlankNode'))
        .toEqual([DF.blankNode('a'), DF.blankNode('a')]);
    });

    it('should find literals', async () => {
      expect(TermUtil.getTermsOfType(single, 'Literal')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'Literal')).toEqual([DF.literal('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'Literal'))
        .toEqual([DF.literal('a'), DF.literal('a')]);
    });

    it('should find variables', async () => {
      expect(TermUtil.getTermsOfType(single, 'Variable')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'Variable')).toEqual([DF.variable('a')]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'Variable'))
        .toEqual([DF.variable('a'), DF.variable('a')]);
    });

    it('should find default graphs', async () => {
      expect(TermUtil.getTermsOfType(single, 'DefaultGraph')).toEqual([]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypes, 'DefaultGraph')).toEqual([DF.defaultGraph()]);
      expect(TermUtil.getTermsOfType(equalValueMixedTypesDuplicates, 'DefaultGraph'))
        .toEqual([DF.defaultGraph(), DF.defaultGraph()]);
    });
  });

  describe('#getNamedNodes', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getNamedNodes(empty)).toEqual([]);
    });

    it('should find named nodes', async () => {
      expect(TermUtil.getNamedNodes(single)).toEqual(single);
      expect(TermUtil.getNamedNodes(equalValueMixedTypes)).toEqual([DF.namedNode('a')]);
      expect(TermUtil.getNamedNodes(equalValueMixedTypesDuplicates))
        .toEqual([DF.namedNode('a'), DF.namedNode('a')]);
    });
  });

  describe('#getBlankNodes', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getNamedNodes(empty)).toEqual([]);
    });

    it('should find blank nodes', async () => {
      expect(TermUtil.getBlankNodes(single)).toEqual([]);
      expect(TermUtil.getBlankNodes(equalValueMixedTypes)).toEqual([DF.blankNode('a')]);
      expect(TermUtil.getBlankNodes(equalValueMixedTypesDuplicates))
        .toEqual([DF.blankNode('a'), DF.blankNode('a')]);
    });
  });

  describe('#getLiterals', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getLiterals(empty)).toEqual([]);
    });

    it('should find literals', async () => {
      expect(TermUtil.getLiterals(single)).toEqual([]);
      expect(TermUtil.getLiterals(equalValueMixedTypes)).toEqual([DF.literal('a')]);
      expect(TermUtil.getLiterals(equalValueMixedTypesDuplicates))
        .toEqual([DF.literal('a'), DF.literal('a')]);
    });
  });

  describe('#getVariables', () => {
    it('should apply to the empty array', async () => {
      return expect(TermUtil.getVariables(empty)).toEqual([]);
    });

    it('should find variables', async () => {
      expect(TermUtil.getVariables(single)).toEqual([]);
      expect(TermUtil.getVariables(equalValueMixedTypes)).toEqual([DF.variable('a')]);
      expect(TermUtil.getVariables(equalValueMixedTypesDuplicates))
        .toEqual([DF.variable('a'), DF.variable('a')]);
    });

    it('should find default graphs', async () => {
      expect(TermUtil.getDefaultGraphs(single)).toEqual([]);
      expect(TermUtil.getDefaultGraphs(equalValueMixedTypes)).toEqual([DF.defaultGraph()]);
      expect(TermUtil.getDefaultGraphs(equalValueMixedTypesDuplicates))
        .toEqual([DF.defaultGraph(), DF.defaultGraph()]);
    });
  });
});
