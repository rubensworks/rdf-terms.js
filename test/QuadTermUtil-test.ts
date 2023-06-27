import { DataFactory } from "rdf-data-factory";
import * as RDF from "@rdfjs/types";
import * as QuadTermUtil from "../lib/QuadTermUtil";

const DF = new DataFactory<RDF.BaseQuad>();

describe('QuadTermUtil', () => {

  const quadNamedNodes: RDF.BaseQuad = DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g'));
  const quadVariables: RDF.BaseQuad = DF.quad(DF.variable('s'), DF.variable('p'), DF.variable('o'), DF.variable('g'));
  const quadVariablesAndNamedNodes: RDF.BaseQuad = DF.quad(DF.variable('s'), DF.namedNode('p'), DF.variable('o'), DF.namedNode('g'));
  const tripleNamedNodes: RDF.BaseQuad = DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'));
  const quotedQuadNamedNodes: RDF.BaseQuad = DF.quad(
    DF.quad(
      DF.quad(DF.namedNode('s1.1'), DF.namedNode('p1.1'), DF.namedNode('o1.1'), DF.namedNode('g1.1')),
      DF.namedNode('p1'),
      DF.namedNode('o1'),
      DF.namedNode('g1'),
    ),
    DF.quad(DF.namedNode('s2'), DF.namedNode('p2'), DF.namedNode('o2'), DF.namedNode('g2')),
    DF.quad(DF.namedNode('s3'), DF.namedNode('p3'), DF.namedNode('o3'), DF.namedNode('g3')),
    DF.quad(DF.namedNode('s4'), DF.namedNode('p4'), DF.namedNode('o4'), DF.namedNode('g4')),
  );
  const quotedQuadMixed: RDF.BaseQuad = DF.quad(
    DF.quad(
      DF.quad(DF.namedNode('s1.1'), DF.namedNode('p1.1'), DF.namedNode('o1.1'), DF.namedNode('g1.1')),
      DF.namedNode('p1'),
      DF.literal('o1'),
      DF.namedNode('g1'),
    ),
    DF.quad(DF.namedNode('s2'), DF.namedNode('p2'), DF.namedNode('o2'), DF.namedNode('g2')),
    DF.quad(DF.namedNode('s3'), DF.namedNode('p3'), DF.literal('o3'), DF.namedNode('g3')),
    DF.quad(DF.namedNode('s4'), DF.namedNode('p4'), DF.namedNode('o4'), DF.namedNode('g4')),
  );

  describe('#matchBaseQuadPattern', () => {
    it('Identical terms should always match', () => {
      expect<boolean>(QuadTermUtil.matchPatternMappings(quadNamedNodes, quadNamedNodes)).toEqual<boolean>(true);
      expect<Record<string, RDF.Term> | false>(QuadTermUtil.matchPatternMappings(quadNamedNodes, quadNamedNodes, { returnMappings: true })).toEqual({});
      expect<boolean>(QuadTermUtil.matchPatternMappings(quadVariables, quadVariables)).toEqual<boolean>(true);
      expect<boolean>(QuadTermUtil.matchPatternMappings(quadVariablesAndNamedNodes, quadVariablesAndNamedNodes)).toEqual<boolean>(true);
      expect<boolean>(QuadTermUtil.matchPatternMappings(tripleNamedNodes, tripleNamedNodes)).toEqual<boolean>(true);
    });
    it('Should match all values against all different variables - but not the other way around', () => {
      expect(QuadTermUtil.matchPatternMappings(quadNamedNodes, quadVariables)).toEqual<boolean>(true);
      expect(QuadTermUtil.matchPatternMappings(quadVariables, quadNamedNodes)).toBeFalsy();
    });
    it('Should not match if the same variables in the pattern do not match the same thing in the quad', () => {
      expect(QuadTermUtil.matchPatternMappings(
        quadNamedNodes,
        DF.quad(DF.variable('s'), DF.variable('p'), DF.variable('s'), DF.variable('g')),
      )).toBeFalsy();
      expect(QuadTermUtil.matchPatternMappings(
        quadVariables,
        DF.quad(DF.variable('s'), DF.variable('p'), DF.variable('s'), DF.variable('g')),
      )).toBeFalsy();
    });
    it('Should demonstrate correct behvaior in nested BaseQuads', () => {
      expect(QuadTermUtil.matchPatternMappings(
          DF.quad(quadVariables, DF.variable('p'), DF.variable('o'), DF.variable('g')),
          DF.quad(quadVariables, DF.variable('p'), DF.variable('o'), DF.variable('g'))
          )).toBeTruthy();
      expect(QuadTermUtil.matchPatternMappings(
          DF.quad(quadVariables, DF.variable('p'), DF.variable('f'), DF.variable('g')),
          DF.quad(quadVariables, DF.variable('p'), DF.variable('o'), DF.variable('g')),
          )).toBeFalsy();
      expect(QuadTermUtil.matchPatternMappings(
         DF.quad(quadVariables, DF.variable('p'), DF.variable('f'), DF.variable('g')),
         DF.quad(quadVariables, DF.variable('p'), DF.variable('o'), DF.variable('g')),
         { skipVarMapping: true }
         )).toBeTruthy();
    });
  })

  describe('#getTerms', () => {
    it('should get the terms from a quad', async () => {
      return expect(QuadTermUtil.getTerms(quadNamedNodes))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should get the terms from a triple', async () => {
      return expect(QuadTermUtil.getTerms(tripleNamedNodes))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.defaultGraph()]);
    });

    it('should get the terms from a quad when the default graph is ignored', async () => {
      return expect(QuadTermUtil.getTerms(quadNamedNodes, true))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should get the terms from a triple when the default graph is ignored', async () => {
      return expect(QuadTermUtil.getTerms(tripleNamedNodes, true))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o')]);
    });
  });

  describe('#getTermsNested', () => {
    it('should get the terms from a quad', async () => {
      return expect(QuadTermUtil.getTermsNested(quadNamedNodes))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should get the terms from a quad when the default graph is ignored', async () => {
      return expect(QuadTermUtil.getTermsNested(quadNamedNodes, true))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should get the terms from a nested quad', async () => {
      return expect(QuadTermUtil.getTermsNested(
        DF.quad(
          DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')),
          DF.namedNode('p'),
          DF.namedNode('o'),
          DF.namedNode('g'),
        )
      ))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should get the terms from a deeply nested quad', async () => {
      return expect(QuadTermUtil.getTermsNested(
        DF.quad(
          DF.quad(
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ),
          DF.namedNode('p'),
          DF.namedNode('o'),
          DF.namedNode('g'),
        )
      ))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });
  });

  describe('#getNamedTerms', () => {
    it('should get the named terms from a quad', async () => {
      return expect(QuadTermUtil.getNamedTerms(quadNamedNodes))
        .toEqual([
          { key: 'subject', value: DF.namedNode('s') },
          { key: 'predicate', value: DF.namedNode('p') },
          { key: 'object', value: DF.namedNode('o') },
          { key: 'graph', value: DF.namedNode('g') },
        ]);
    });

    it('should get the named terms from a triple', async () => {
      return expect(QuadTermUtil.getNamedTerms(tripleNamedNodes))
        .toEqual([
          { key: 'subject', value: DF.namedNode('s') },
          { key: 'predicate', value: DF.namedNode('p') },
          { key: 'object', value: DF.namedNode('o') },
          { key: 'graph', value: DF.defaultGraph() },
        ]);
    });
  });

  describe('#collectNamedTerms', () => {
    it('should create a quad from named terms', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'object', value: DF.namedNode('o') },
        { key: 'graph', value: DF.namedNode('g') },
      ])).toEqual(quadNamedNodes);
    });

    it('should create a quad from named terms with a custom data factory', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'object', value: DF.namedNode('o') },
        { key: 'graph', value: DF.namedNode('g') },
      ], null, DF)).toEqual(quadNamedNodes);
    });

    it('should create a triple from named terms', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'object', value: DF.namedNode('o') },
        { key: 'graph', value: DF.defaultGraph() },
      ])).toEqual(tripleNamedNodes);
    });

    it('should create a quad from named terms with a callback for no missing terms', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'object', value: DF.namedNode('o') },
        { key: 'graph', value: DF.namedNode('g') },
      ], () => null)).toEqual(quadNamedNodes);
    });

    it('should create a quad from named terms with a callback for a missing subject', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'object', value: DF.namedNode('o') },
        { key: 'graph', value: DF.namedNode('g') },
      ], (termName: QuadTermUtil.QuadTermName) => DF.variable(termName)))
        .toEqual(DF.quad(DF.variable('subject'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')));
    });

    it('should create a quad from named terms with a callback for a missing object', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'graph', value: DF.namedNode('g') },
      ], (termName: QuadTermUtil.QuadTermName) => DF.variable(termName)))
        .toEqual(DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.variable('object'), DF.namedNode('g')));
    });

    it('should create a quad from named terms with a callback for a missing predicate', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'object', value: DF.namedNode('o') },
        { key: 'graph', value: DF.namedNode('g') },
      ], (termName: QuadTermUtil.QuadTermName) => DF.variable(termName)))
        .toEqual(DF.quad(DF.namedNode('s'), DF.variable('predicate'), DF.namedNode('o'), DF.namedNode('g')));
    });

    it('should create a triple from named terms with a callback for a missing graph', async () => {
      return expect(QuadTermUtil.collectNamedTerms([
        { key: 'subject', value: DF.namedNode('s') },
        { key: 'predicate', value: DF.namedNode('p') },
        { key: 'object', value: DF.namedNode('o') },
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
      expect(values).toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
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
      expect(values).toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.defaultGraph()]);
      expect(keys).toEqual(QuadTermUtil.QUAD_TERM_NAMES);
    });
  });

  describe('#forEachTermsNested', () => {
    it('should call a callback for each quad term', async () => {
      const values = [];
      const keys = [];
      const cb = jest.fn((value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => {
        values.push(value);
        keys.push(key);
      });
      QuadTermUtil.forEachTermsNested(quadNamedNodes, cb);
      expect(cb).toHaveBeenCalledTimes(4);
      expect(values).toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
      expect(keys).toEqual([
        [ 'subject' ],
        [ 'predicate' ],
        [ 'object' ],
        [ 'graph' ],
      ]);
    });

    it('should call a callback for each triple term', async () => {
      const values = [];
      const keys = [];
      const cb = jest.fn((value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => {
        values.push(value);
        keys.push(key);
      });
      QuadTermUtil.forEachTermsNested(tripleNamedNodes, cb);
      expect(cb).toHaveBeenCalledTimes(4);
      expect(values).toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.defaultGraph()]);
      expect(keys).toEqual([
        [ 'subject' ],
        [ 'predicate' ],
        [ 'object' ],
        [ 'graph' ],
      ]);
    });

    it('should call a callback for each nested quoted quad term', async () => {
      const values = [];
      const keys = [];
      const cb = jest.fn((value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => {
        values.push(value);
        keys.push(key);
      });
      QuadTermUtil.forEachTermsNested(quotedQuadNamedNodes, cb);
      expect(cb).toHaveBeenCalledTimes(19);
      expect(values).toEqual([
        DF.namedNode('s1.1'),
        DF.namedNode('p1.1'),
        DF.namedNode('o1.1'),
        DF.namedNode('g1.1'),
        DF.namedNode('p1'),
        DF.namedNode('o1'),
        DF.namedNode('g1'),
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
        DF.namedNode('g2'),
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
        DF.namedNode('g3'),
        DF.namedNode('s4'),
        DF.namedNode('p4'),
        DF.namedNode('o4'),
        DF.namedNode('g4'),
      ]);
      expect(keys).toEqual([
        [
          "subject",
          "subject",
          "subject"
        ],
        [
          "subject",
          "subject",
          "predicate"
        ],
        [
          "subject",
          "subject",
          "object"
        ],
        [
          "subject",
          "subject",
          "graph"
        ],
        [
          "subject",
          "predicate"
        ],
        [
          "subject",
          "object"
        ],
        [
          "subject",
          "graph"
        ],
        [
          "predicate",
          "subject"
        ],
        [
          "predicate",
          "predicate"
        ],
        [
          "predicate",
          "object"
        ],
        [
          "predicate",
          "graph"
        ],
        [
          "object",
          "subject"
        ],
        [
          "object",
          "predicate"
        ],
        [
          "object",
          "object"
        ],
        [
          "object",
          "graph"
        ],
        [
          "graph",
          "subject"
        ],
        [
          "graph",
          "predicate"
        ],
        [
          "graph",
          "object"
        ],
        [
          "graph",
          "graph"
        ]
      ]);
    });
  });

  describe('#filterTerms', () => {
    it('should filter for an always falsy callback', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes, () => false))
        .toEqual([]);
    });

    it('should filter for an always truthy callback', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes, () => true))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should filter for \'s\' values', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes, (value: RDF.Term) => value.value === 's'))
        .toEqual([DF.namedNode('s')]);
    });

    it('should filter for predicates', async () => {
      expect(QuadTermUtil.filterTerms(quadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName) => key === 'predicate'))
        .toEqual([DF.namedNode('p')]);
    });
  });

  describe('#filterTermsNested', () => {
    it('should filter for an always falsy callback', async () => {
      expect(QuadTermUtil.filterTermsNested(quadNamedNodes, () => false))
        .toEqual([]);
    });

    it('should filter for an always truthy callback', async () => {
      expect(QuadTermUtil.filterTermsNested(quadNamedNodes, () => true))
        .toEqual([DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')]);
    });

    it('should filter for \'s\' values', async () => {
      expect(QuadTermUtil.filterTermsNested(quadNamedNodes, (value: RDF.Term) => value.value === 's'))
        .toEqual([DF.namedNode('s')]);
    });

    it('should filter for predicates', async () => {
      expect(QuadTermUtil.filterTermsNested(quadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => key[0] === 'predicate'))
        .toEqual([DF.namedNode('p')]);
    });

    it('should filter for nested predicates in leaf position', async () => {
      expect(QuadTermUtil.filterTermsNested(quotedQuadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => key[key.length - 1] === 'predicate'))
        .toEqual([DF.namedNode('p1.1'), DF.namedNode('p1'), DF.namedNode('p2'), DF.namedNode('p3'), DF.namedNode('p4')]);
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

  describe('#filterQuadTermNamesNested', () => {
    it('should filter for an always falsy callback', async () => {
      expect(QuadTermUtil.filterQuadTermNamesNested(quadNamedNodes, () => false))
        .toEqual([]);
    });

    it('should filter for an always truthy callback', async () => {
      expect(QuadTermUtil.filterQuadTermNamesNested(quadNamedNodes, () => true))
        .toEqual([
          ['subject'],
          ['predicate'],
          ['object'],
          ['graph'],
        ]);
    });

    it('should filter for \'s\' values', async () => {
      expect(QuadTermUtil.filterQuadTermNamesNested(quadNamedNodes, (value: RDF.Term) => value.value === 's'))
        .toEqual([['subject']]);
    });

    it('should filter for predicates', async () => {
      expect(QuadTermUtil.filterQuadTermNamesNested(quadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => key[0] === 'predicate'))
        .toEqual([['predicate']]);
    });

    it('should filter for nested predicates in the leaf position', async () => {
      expect(QuadTermUtil.filterQuadTermNamesNested(quotedQuadNamedNodes,
        (value: RDF.Term, key: QuadTermUtil.QuadTermName[]) => key[key.length - 1] === 'predicate'))
        .toEqual([
          ['subject', 'subject', 'predicate'],
          ['subject', 'predicate'],
          ['predicate', 'predicate'],
          ['object', 'predicate'],
          ['graph', 'predicate'],
        ]);
    });
  });

  describe('#mapTerms', () => {
    it('should map for an identity function', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term) => term))
        .toEqual(quadNamedNodes);
    });

    it('should map for an identity function with a custom data factory', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term) => term, DF))
        .toEqual(quadNamedNodes);
    });

    it('should map for an function resulting in a fixed variable', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term) => DF.variable('v')))
        .toEqual(DF.quad(DF.variable('v'), DF.variable('v'), DF.variable('v'), DF.variable('v')));
    });

    it('should map for an function resulting in a variable for subject and object', async () => {
      expect(QuadTermUtil.mapTerms(quadNamedNodes, (term: RDF.Term, key: QuadTermUtil.QuadTermName) => {
        if (key === 'subject' || key === 'object') {
          return DF.variable(key);
        }
        return term;
      })).toEqual(DF.quad(DF.variable('subject'), DF.namedNode('p'), DF.variable('object'), DF.namedNode('g')));
    });
  });

  describe('#mapTermsNested', () => {
    it('should map for an identity function', async () => {
      expect(QuadTermUtil.mapTermsNested(quadNamedNodes, (term: RDF.Term) => term))
        .toEqual(quadNamedNodes);
    });

    it('should map for an identity function with a custom data factory', async () => {
      expect(QuadTermUtil.mapTermsNested(quadNamedNodes, (term: RDF.Term) => term, DF))
        .toEqual(quadNamedNodes);
    });

    it('should map for an function resulting in a fixed variable', async () => {
      expect(QuadTermUtil.mapTermsNested(quadNamedNodes, (term: RDF.Term) => DF.variable('v')))
        .toEqual(DF.quad(DF.variable('v'), DF.variable('v'), DF.variable('v'), DF.variable('v')));
    });

    it('should map for an function resulting in a variable for subject and object', async () => {
      expect(QuadTermUtil.mapTermsNested(quadNamedNodes, (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => {
        if (key[0] === 'subject' || key[0] === 'object') {
          return DF.variable(key[0]);
        }
        return term;
      })).toEqual(DF.quad(DF.variable('subject'), DF.namedNode('p'), DF.variable('object'), DF.namedNode('g')));
    });

    it('should map for an function resulting in a variable for subject and object for a quoted triple', async () => {
      expect(QuadTermUtil.mapTermsNested(quotedQuadNamedNodes, (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => {
        if (key[key.length - 1] === 'subject' || key[key.length - 1] === 'object') {
          return DF.variable(key.join('-'));
        }
        return term;
      })).toEqual(DF.quad(
        DF.quad(
          DF.quad(DF.variable('subject-subject-subject'), DF.namedNode('p1.1'), DF.variable('subject-subject-object'), DF.namedNode('g1.1')),
          DF.namedNode('p1'),
          DF.variable('subject-object'),
          DF.namedNode('g1'),
        ),
        DF.quad(DF.variable('predicate-subject'), DF.namedNode('p2'), DF.variable('predicate-object'), DF.namedNode('g2')),
        DF.quad(DF.variable('object-subject'), DF.namedNode('p3'), DF.variable('object-object'), DF.namedNode('g3')),
        DF.quad(DF.variable('graph-subject'), DF.namedNode('p4'), DF.variable('graph-object'), DF.namedNode('g4')),
      ));
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

  describe('#reduceTermsNested', () => {
    it('should reduce for a string concat function', async () => {
      expect(QuadTermUtil.reduceTermsNested(quadNamedNodes, (prev: string, term: RDF.Term) => prev + term.value, ''))
        .toEqual('spog');
      expect(QuadTermUtil.reduceTermsNested(quadNamedNodes,
        (prev: string, term: RDF.Term, keys: QuadTermUtil.QuadTermName[]) => prev + `'${keys.join('.')}'`, ''))
        .toEqual(`'subject''predicate''object''graph'`);
      expect(QuadTermUtil.reduceTermsNested(quotedQuadNamedNodes,
        (prev: string, term: RDF.Term, keys: QuadTermUtil.QuadTermName[]) => prev + `'${keys.join('.')}'`, ''))
        .toEqual(`'subject.subject.subject''subject.subject.predicate''subject.subject.object''subject.subject.graph''subject.predicate''subject.object''subject.graph''predicate.subject''predicate.predicate''predicate.object''predicate.graph''object.subject''object.predicate''object.object''object.graph''graph.subject''graph.predicate''graph.object''graph.graph'`);
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

  describe('#everyTermsNested', () => {
    it('checking for named nodes', async () => {
      expect(QuadTermUtil.everyTermsNested(quadNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeTruthy();
      expect(QuadTermUtil.everyTermsNested(quadVariables,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeFalsy();
      expect(QuadTermUtil.everyTermsNested(quadVariablesAndNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeFalsy();
      expect(QuadTermUtil.everyTermsNested(quotedQuadNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeTruthy();
      expect(QuadTermUtil.everyTermsNested(quotedQuadMixed,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeFalsy();
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

  describe('#someTermsNested', () => {
    it('checking for named nodes', async () => {
      expect(QuadTermUtil.someTermsNested(quadNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeTruthy();
      expect(QuadTermUtil.someTermsNested(quadVariables,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeFalsy();
      expect(QuadTermUtil.someTermsNested(quadVariablesAndNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'NamedNode')).toBeTruthy();
      expect(QuadTermUtil.someTermsNested(quotedQuadNamedNodes,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'Literal')).toBeFalsy();
      expect(QuadTermUtil.someTermsNested(quotedQuadMixed,
        (term: RDF.Term, key: QuadTermUtil.QuadTermName[]) => term.termType === 'Literal')).toBeTruthy();
    });
  });

  describe('#getValueNestedPath', () => {
    it('for an empty path', async () => {
      expect(QuadTermUtil.getValueNestedPath(DF.namedNode('s'),[]))
        .toEqual(DF.namedNode('s'));
      expect(QuadTermUtil.getValueNestedPath(quadNamedNodes,[]))
        .toEqual(quadNamedNodes);
    });

    it('for a valid non-empty path', async () => {
      expect(QuadTermUtil.getValueNestedPath(DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')),['subject']))
        .toEqual(DF.namedNode('s'));
      expect(QuadTermUtil.getValueNestedPath(DF.quad(
        DF.quad(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.quad(
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('TREASURE'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ),
          DF.namedNode('g'),
        ),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ),['subject', 'object', 'subject', 'predicate']))
        .toEqual(DF.namedNode('TREASURE'));
    });

    it('should throw for an invalid path', async () => {
      expect(() => QuadTermUtil.getValueNestedPath(DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g')),['subject', 'predicate']))
        .toThrow('Tried to get predicate from term of type NamedNode');
      expect(() => QuadTermUtil.getValueNestedPath(DF.quad(
        DF.quad(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.quad(
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('TREASURE'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ),
          DF.namedNode('g'),
        ),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ),['subject', 'object', 'subject', 'predicate', 'object']))
        .toThrow('Tried to get object from term of type NamedNode');
    });
  });

  describe('#matchPattern', () => {
    const quadMatch = DF.quad(
      DF.namedNode('subject'),
      DF.namedNode('predicate'),
      DF.namedNode('object'),
      DF.namedNode('graph'),
    );

    it('a quad and no terms', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch)).toBeTruthy();
    });

    it('a quad and subject term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.blankNode('subject'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.variable('varS'))).toBeTruthy();
    });

    it('a quad and subject and predicate term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.blankNode('predicate'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.variable('varP'))).toBeTruthy();
    });

    it('a quad and subject, predicate and object term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.blankNode('object'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.variable('varO'))).toBeTruthy();
    });

    it('a quad and subject, predicate, object and graph term', async () => {
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object'), null)).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object'), DF.namedNode('graph'))).toBeTruthy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object'), DF.blankNode('graph'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object'), DF.namedNode('graph-fail'))).toBeFalsy();
      expect(QuadTermUtil.matchPattern(quadMatch,
        DF.namedNode('subject'), DF.namedNode('predicate'),
        DF.namedNode('object'), DF.variable('varG'))).toBeTruthy();
    });
  });

  describe('#matchPatternComplete', () => {
    const quadMatch = DF.quad(
      DF.namedNode('subject'),
      DF.namedNode('predicate'),
      DF.namedNode('object'),
      DF.namedNode('graph'),
    );

    it('a quad without variables', async () => {
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subjectF'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicateF'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.namedNode('objectF'),
        DF.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graphF'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.blankNode('subject'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        <any> DF.blankNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.blankNode('object'),
        DF.namedNode('graph'),
      ))).toBeFalsy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.blankNode('graph'),
      ))).toBeFalsy();
    });

    it('a quad with variables', async () => {
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.variable('var'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.variable('var'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.variable('var'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.namedNode('subject'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.variable('var'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.variable('varS'),
        DF.variable('varP'),
        DF.variable('varO'),
        DF.variable('varG'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(quadMatch, DF.quad(
        DF.variable('varS'),
        DF.variable('varP'),
        DF.namedNode('fail'),
        DF.variable('varG'),
      ))).toBeFalsy();
    });

    const nestedQuadMatch = DF.quad(
      DF.quad(
        DF.namedNode('subject-sub'),
        DF.namedNode('predicate-sub'),
        DF.namedNode('object-sub'),
        DF.namedNode('graph-sub'),
      ),
      DF.namedNode('predicate'),
      DF.namedNode('object'),
      DF.namedNode('graph'),
    );

    it('a nested quad with variables', async () => {
      expect(QuadTermUtil.matchPatternComplete(nestedQuadMatch, DF.quad(
        DF.variable('var'),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(nestedQuadMatch, DF.quad(
        DF.quad(
          DF.namedNode('subject-sub'),
          DF.namedNode('predicate-sub'),
          DF.namedNode('object-sub'),
          DF.namedNode('graph-sub'),
        ),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(nestedQuadMatch, DF.quad(
        DF.quad(
          DF.variable('var'),
          DF.namedNode('predicate-sub'),
          DF.namedNode('object-sub'),
          DF.namedNode('graph-sub'),
        ),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(nestedQuadMatch, DF.quad(
        DF.quad(
          DF.namedNode('subject-sub'),
          DF.variable('var'),
          DF.namedNode('object-sub'),
          DF.namedNode('graph-sub'),
        ),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(nestedQuadMatch, DF.quad(
        DF.quad(
          DF.namedNode('subject-sub'),
          DF.namedNode('predicate-sub'),
          DF.variable('var'),
          DF.namedNode('graph-sub'),
        ),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
      expect(QuadTermUtil.matchPatternComplete(nestedQuadMatch, DF.quad(
        DF.quad(
          DF.namedNode('subject-sub'),
          DF.namedNode('predicate-sub'),
          DF.namedNode('object-sub'),
          DF.variable('var'),
        ),
        DF.namedNode('predicate'),
        DF.namedNode('object'),
        DF.namedNode('graph'),
      ))).toBeTruthy();
    });
  });
});
