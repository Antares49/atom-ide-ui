'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));











var _atom = require('atom');var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../nuclide-commons/nuclideUri'));}var _FindReferencesModel;
function _load_FindReferencesModel() {return _FindReferencesModel = _interopRequireDefault(require('../lib/FindReferencesModel'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// convenience location creator
function range(startLine, startColumn, endLine, endColumn) {
  return new _atom.Range(
  new _atom.Point(startLine, startColumn),
  new _atom.Point(endLine, endColumn));

} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */describe('FindReferencesModel', () => {let TEST1;let TEST2;const nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');beforeEach(() => {waitsForPromise((0, _asyncToGenerator.default)(function* () {
      const fixtureDir = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'fixtures');
      TEST1 = (_nuclideUri || _load_nuclideUri()).default.join(fixtureDir, 'test1');
      TEST2 = (_nuclideUri || _load_nuclideUri()).default.join(fixtureDir, 'test2');
    }));
  });

  it('should group references by file', () => {
    waitsForPromise((0, _asyncToGenerator.default)(function* () {
      const refs = [
      // These should be sorted in the final output.
      { uri: TEST1, name: 'test1', range: range(8, 0, 9, 1) },
      { uri: TEST1, name: 'test1', range: range(0, 0, 0, 1) },
      { uri: TEST2, name: 'test2', range: range(1, 0, 1, 1) }];

      const model = new (_FindReferencesModel || _load_FindReferencesModel()).default(
      '/test',
      'testFunction',
      'title',
      refs);

      expect(model.getReferenceCount()).toEqual(3);
      expect(model.getFileCount()).toEqual(2);

      const result = yield model.getFileReferences(0, 100);
      // Note the 1 line of context in the previews (but make sure it doesn't overflow)
      const expectedResult = [
      {
        uri: TEST1,
        grammar: nullGrammar,
        previewText: ['1\n2', '8\n9'],
        refGroups: [
        { references: [refs[1]], startLine: 0, endLine: 1 },
        { references: [refs[0]], startLine: 7, endLine: 8 }] },


      {
        uri: TEST2,
        grammar: nullGrammar,
        previewText: ['1\n2\n3'],
        refGroups: [{ references: [refs[2]], startLine: 0, endLine: 2 }] }];


      expect(result).toEqual(expectedResult);

      // It should also work if we fetch each one separately.
      const res1 = yield model.getFileReferences(0, 1);
      const res2 = yield model.getFileReferences(1, 1);
      expect(res1.concat(res2)).toEqual(expectedResult);
    }));
  });

  it('should group overlapping references', () => {
    waitsForPromise((0, _asyncToGenerator.default)(function* () {
      // Adjacent blocks (including context) should get merged into a single group.
      const refs = [
      { uri: TEST1, name: 'test1', range: range(0, 0, 0, 1) },
      { uri: TEST1, name: 'test1', range: range(1, 0, 1, 1) },
      { uri: TEST1, name: 'test1', range: range(3, 0, 3, 1) },
      { uri: TEST1, name: 'test1', range: range(6, 0, 6, 1) },
      { uri: TEST1, name: 'test1', range: range(7, 0, 7, 1) },
      // and overlapping ranges
      { uri: TEST2, name: 'test2', range: range(0, 0, 3, 1) },
      { uri: TEST2, name: 'test2', range: range(1, 0, 2, 1) },
      // ignore duplicates
      { uri: TEST1, name: 'dupe!', range: range(0, 0, 0, 1) }];

      const model = new (_FindReferencesModel || _load_FindReferencesModel()).default(
      '/test',
      'testFunction',
      'title',
      refs);

      expect(model.getReferenceCount()).toEqual(7);
      expect(model.getFileCount()).toEqual(2);

      const result = yield model.getFileReferences(0, 100);
      expect(result).toEqual([
      {
        uri: TEST1,
        grammar: nullGrammar,
        previewText: ['1\n2\n3\n4\n5', '6\n7\n8\n9'],
        refGroups: [
        { references: refs.slice(0, 3), startLine: 0, endLine: 4 },
        { references: refs.slice(3, 5), startLine: 5, endLine: 8 }] },


      {
        uri: TEST2,
        grammar: nullGrammar,
        previewText: ['1\n2\n3\n4\n5'],
        refGroups: [{ references: refs.slice(5, 7), startLine: 0, endLine: 4 }] }]);


    }));
  });

  it('should hide bad files', () => {
    waitsForPromise((0, _asyncToGenerator.default)(function* () {
      const refs = [
      { uri: TEST1, name: 'test1', range: range(0, 0, 0, 1) },
      { uri: 'bad', name: 'bad', range: range(1, 0, 1, 1) }];

      const model = new (_FindReferencesModel || _load_FindReferencesModel()).default(
      '/test',
      'testFunction',
      'title',
      refs);

      expect(model.getReferenceCount()).toEqual(2);
      expect(model.getFileCount()).toEqual(2);

      const result = yield model.getFileReferences(0, 100);
      // Bad file should be silently hidden.
      expect(result).toEqual([
      {
        uri: TEST1,
        grammar: nullGrammar,
        previewText: ['1\n2'],
        refGroups: [{ references: [refs[0]], startLine: 0, endLine: 1 }] }]);


    }));
  });
});