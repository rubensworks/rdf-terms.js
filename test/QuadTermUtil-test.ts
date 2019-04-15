import {defaultGraph, namedNode, quad, triple, variable} from "@rdfjs/data-model";
import * as DataFactory from "@rdfjs/data-model";
import * as RDF from "rdf-js";
import * as QuadTermUtil from "../lib/QuadTermUtil";

describe('QuadTermUtil', () => {

  const quadNamedNodes: RDF.Quad = quad(namedNode('s'), namedNode('p'), namedNode('o'), namedNode('g'));
  const quadVariables: RDF.Quad = quad(variable('s'), variable('p'), variable('o'), variable('g'));
  const quadVariablesAndNamedNodes: RDF.Quad = quad(variable('s'), namedNode('p'), variable('o'), namedNode('g'));
  const tripleNamedNodes: RDF.Quad = triple(namedNode('s'), namedNode('p'), namedNode('o'));

  describe('#getTerms', () => {
    it('should get the terms from a quad', async () => {
      return expect(QuadTermUtil.getTerms(quadNamedNodes))
        .toEqual([namedNode('s'), namedNode('p'), namedNode('o'), namedNode('g')]);
    });

    it('should get the terms from a triple', async () => {
      return expect(QuadTermUtil.getTerms(tripleNamedNodes))
        .toEqual([namedNode('s'), namedNode('p'), namedNode('o'), defaultGraph()]);
    });

    it('should get the terms from a quad when the default graph is ignored', async () => {
      return expect(QuadTermUtil.getTerms(quadNamedNodes, true))
        .toEqual([namedNode('s'), namedNode('p'), namedNode('o'), namedNode('g')]);
    });

    it('should get the terms from a triple when the default graph is ignored', async () => {
      return expect(QuadTermUtil.getTerms(tripleNamedNodes, true))
        .toEqual([namedNode('s'), namedNode('p'), namedNode('o')]);
    });
  });

  describe('#getNamedTerms', () => {
    it('should get the named terms from a quad', async () => {
      return expect(QuadTermUtil.getNamedTerms(quadNamedNodes))
        .toEqual([
          { key: 'subject', value: namedNode('s') },
          { key: 'predicate', value: namedNode('p') },
          { key: 'object', value: namedNode('o') },
          { key: 'graph', value: namedNode('g') },
        ]);
    });

    it('should get the named terms from a triple', async () => {
      return expect(QuadTermUtil.getNamedTerms(tripleNamedNodes))
        .toEqual([
          { key: 'subject', value: namedNode('s') },
          { key: 'predicate', value: namedNode('p') },
          { key: 'object', value: namedNode('o') },
          { key: 'graph', value: defaultGraph() },
        ]);
    });
  });

  describe('#collectNamedTerms', () => {
    it('should create a quad from named terms', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'predicate', value: namedNode('p') },
        { key: 'object', value: namedNode('o') },
        { key: 'graph', value: namedNode('g') },
      ])).toEqual(quadNamedNodes);
    });

    it('should create a quad from named terms with a custom data factory', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'predicate', value: namedNode('p') },
        { key: 'object', value: namedNode('o') },
        { key: 'graph', value: namedNode('g') },
      ], null, DataFactory)).toEqual(quadNamedNodes);
    });

    it('should create a triple from named terms', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'predicate', value: namedNode('p') },
        { key: 'object', value: namedNode('o') },
        { key: 'graph', value: defaultGraph() },
      ])).toEqual(tripleNamedNodes);
    });

    it('should create a quad from named terms with a callback for no missing terms', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'predicate', value: namedNode('p') },
        { key: 'object', value: namedNode('o') },
        { key: 'graph', value: namedNode('g') },
      ], () => null)).toEqual(quadNamedNodes);
    });

    it('should create a quad from named terms with a callback for a missing subject', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'predicate', value: namedNode('p') },
        { key: 'object', value: namedNode('o') },
        { key: 'graph', value: namedNode('g') },
      ], (termName: QuadTermUtil.QuadTermName) => variable(termName)))
        .toEqual(quad(namedNode('subject'), variable('p'), namedNode('o'), namedNode('g')));
    });

    it('should create a quad from named terms with a callback for a missing object', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'predicate', value: namedNode('p') },
        { key: 'graph', value: namedNode('g') },
      ], (termName: QuadTermUtil.QuadTermName) => variable(termName)))
        .toEqual(quad(namedNode('s'), variable('p'), namedNode('object'), namedNode('g')));
    });

    it('should create a quad from named terms with a callback for a missing predicate', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'object', value: namedNode('o') },
        { key: 'graph', value: namedNode('g') },
      ], (termName: QuadTermUtil.QuadTermName) => variable(termName)))
        .toEqual(quad(namedNode('s'), variable('predicate'), namedNode('o'), namedNode('g')));
    });

    it('should create a triple from named terms with a callback for a missing graph', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: namedNode('s') },
        { key: 'predicate', value: namedNode('p') },
        { key: 'object', value: namedNode('o') },
      ], (termName: QuadTermUtil.QuadTermName) => null)).toEqual(tripleNamedNodes);
    });
  });

  describe('#forEachTerms', () => {
    it('should call a callback for each quad term', async () => {
      const values = [];
      const keys = [];
      const cb = jest.fn((value: RDF.Term, key: QuadTermUtil.QuadTermName) => {
        values.push(value);
        keys.push(key);
      });
      QuadTermUtil.forEachTerms(quadNamedNodes, cb);
      expect(cb).toHaveBeenCalledTimes(4);
      expect(values).toEqual([namedNode('s'), namedNode('p'), namedNode('o'), namedNode('g')]);
      expect(keys).toEqual(QuadTermUtil.QUAD_TERM_NAMES);
    });

    it('should call a callback for each triple term', async () => {
      const values = [];
      const keys = [];
      const cb = jest.fn((value: RDF.Term, key: QuadTermUtil.QuadTermName) => {
        values.push(value);
        keys.push(key);
      });
      QuadTermUtil.forEachTerms(tripleNamedNodes, cb);
      expect(cb).toHaveBeenCalledTimes(4);
      expect(values).toEqual([namedNode('s'), namedNode('p'), namedNode('o'), defaultGraph()]);
      expect(keys).toEqual(QuadTermUtil.QUAD_TERM_NAMES);
    });
  });

  describe('#filterTerms', () => {
    it('should filter for an always falsy callback', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes, () => false))
        .toEqual([]);
    });

    it('should filter for an always truthy callback', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes, () => true))
        .toEqual([namedNode('s'), namedNode('p'), namedNode('o'), namedNode('g')]);
    });

    it('should filter for \'s\' values', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes, (value: RDF.Term) => value.value === 's'))
        .toEqual([namedNode('s')]);
    });

    it('should filter for predicates', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName) => key === 'predicate'))
        .toEqual([namedNode('p')]);
    });
  });

  describe('#filterQuadTermNames', () => {
    it('should filter for an always falsy callback', async () => {
      expect(QuadTermUtil.filterQuadTermNames(quadNamedNodes, () => false))
        .toEqual([]);
    });

    it('should filter for an always truthy callback', async () => {
      expect(QuadTermUtil.filterQuadTermNames(quadNamedNodes, () => true))
        .toEqual(QuadTermUtil.QUAD_TERM_NAMES);
    });

    it('should filter for \'s\' values', async () => {
      expect(QuadTermUtil.filterQuadTermNames(quadNamedNodes, (value: RDF.Term) => value.value === 's'))
        .toEqual(['subject']);
    });

    it('should filter for predicates', async () => {
      expect(QuadTermUtil.filterQuadTermNames(quadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName) => key === 'predicate'))
        .toEqual(['predicate']);
    });
  });

  describe('#mapTerms', () => {
    it('should map for an identity function', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term) => term))
        .toEqual(quadNamedNodes);
    });

    it('should map for an identity function with a custom data factory', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term) => term, DataFactory))
        .toEqual(quadNamedNodes);
    });

    it('should map for an function resulting in a fixed variable', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term) => variable('v')))
        .toEqual(quad(variable('v'), variable('v'), variable('v'), variable('v')));
    });

    it('should map for an function resulting in a variable for subject and object', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term, key: QuadTermUtil.QuadTermName) => {
        if (key === 'subject' || key === 'object') {
          return variable(key);
        }
        return term;
      })).toEqual(quad(variable('subject'), namedNode('p'), variable('object'), namedNode('g')));
    });
  });

  describe('#reduceTerms', () => {
    it('should reduce for a string concat function', async () => {
      expect(QuadTermUtil.reduceTerms(quadNamedNodes, (prev: string, term: RDF.Term) => prev + term.value, ''))
        .toEqual('spog');
      expect(QuadTermUtil.reduceTerms(quadNamedNodes,
        (prev: string, term: RDF.Term, key: QuadTermUtil.QuadTermName) => prev + key, ''))
        .toEqual('subjectpredicateobjectgraph');
    });
  });

  describe('#everyTerms', () => {
    it('checking for named nodes', async () => {
      expect(QuadTermUtil.everyTerms(quadNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName) => term.termType === 'NamedNode')).toBeTruthy();
      expect(QuadTermUtil.everyTerms(quadVariables,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName) => term.termType === 'NamedNode')).toBeFalsy();
      expect(QuadTermUtil.everyTerms(quadVariablesAndNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName) => term.termType === 'NamedNode')).toBeFalsy();
    });
  });

  describe('#someTerms', () => {
    it('checking for named nodes', async () => {
      expect(QuadTermUtil.someTerms(quadNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName) => term.termType === 'NamedNode')).toBeTruthy();
      expect(QuadTermUtil.someTerms(quadVariables,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName) => term.termType === 'NamedNode')).toBeFalsy();
      expect(QuadTermUtil.someTerms(quadVariablesAndNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName) => term.termType === 'NamedNode')).toBeTruthy();
    });
  });

  describe('#matchPattern', () => {
    const quadMatch = DataFactory.quad(
      DataFactory.namedNode('subject'),
      DataFactory.namedNode('predicate'),
      DataFactory.namedNode('object'),
      DataFactory.namedNode('graph'),
    );

    it('a quad and no terms', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch)).toBeTruthy();
    });

    it('a quad and subject term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.blankNode('subject'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.variable('varS'))).toBeTruthy();
    });

    it('a quad and subject and predicate term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.blankNode('predicate'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.variable('varP'))).toBeTruthy();
    });

    it('a quad and subject, predicate and object term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.blankNode('object'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.variable('varO'))).toBeTruthy();
    });

    it('a quad and subject, predicate, object and graph term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'), null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'), DataFactory.namedNode('graph'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'), DataFactory.blankNode('graph'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'), DataFactory.namedNode('graph-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DataFactory.namedNode('subject'), DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'), DataFactory.variable('varG'))).toBeTruthy();
    });
  });

  describe('#matchPatternComplete', () => {
    const quadMatch = DataFactory.quad(
      DataFactory.namedNode('subject'),
      DataFactory.namedNode('predicate'),
      DataFactory.namedNode('object'),
      DataFactory.namedNode('graph'),
    );

    it('a quad without variables', async () => {
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subjectF'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicateF'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('objectF'),
        DataFactory.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graphF'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.blankNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.blankNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.blankNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.blankNode('graph'),
      ))).toBeFalsy();
    });

    it('a quad with variables', async () => {
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.variable('var'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.variable('var'),
        DataFactory.namedNode('object'),
        DataFactory.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.variable('var'),
        DataFactory.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.namedNode('subject'),
        DataFactory.namedNode('predicate'),
        DataFactory.namedNode('object'),
        DataFactory.variable('var'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.variable('varS'),
        DataFactory.variable('varP'),
        DataFactory.variable('varO'),
        DataFactory.variable('varG'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DataFactory.quad(
        DataFactory.variable('varS'),
        DataFactory.variable('varP'),
        DataFactory.namedNode('fail'),
        DataFactory.variable('varG'),
      ))).toBeFalsy();
    });
  });
});
