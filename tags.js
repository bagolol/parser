define([
    'angular',
    '../../module',
    'text!app/create/directives/tags/tag-option.html',
    'app/create/services/LinkedDataService',
    'app/vivopad/directives/loadingicon/loadingicon',
    'app/main/events',
    'selectize'
], function (angular, module, optionTemplate) {
    'use strict';


    function TagController($scope, events, LinkedDataService, loadingStatuses) {

        $scope.selectize = {
            options: {},
            value: null
        };
        $scope.linkedDataService = {
            ids: [],
            tags: []
        };
        $scope.loadingStatuses = loadingStatuses;
        $scope.loadingStatus = loadingStatuses.notLoading;

        $scope.filteredIds = []; //hold the ids that have been filtered out, a filtered id is an id that is a displayFilter and the tags

        //set up the selectize options
        $scope.selectize.options = {
            labelField: 'preferredLabel',
            searchField: ['preferredLabel', 'disambiguationHint'],
            valueField: 'id',
            plugins: ['remove_button'],
            //TODO - what if we already have this search result, we should cache

            load: function (query, callback) {

                if (query.length < 3) {
                    return;
                }

                $scope.$apply(function () {
                    $scope.loadingStatus = loadingStatuses.loading;
                    $scope.clearSelectizeResults();
                });

                LinkedDataService
                    .getTags({
                        search: query
                    })
                    .then(function (response) {
                        //
                        //remove displayfilter tags so they are not rendered
                        _.remove(response.data.tags, function (tag) {
                            return _.contains($scope.displayFilter, tag.id);
                        });
                        $scope.updateStatus(loadingStatuses.loaded);
                        callback(response.data.tags);
                    }, function (response) {
                        if (response.status !== 400) { //ignore <3 chars error
                            $scope.updateStatus(loadingStatuses.failed);
                        } else {
                            $scope.updateStatus(loadingStatuses.notLoading);
                        }
                    });

            },
            score: function () {
                return function () {
                    return 1;
                };
            },
            render: {
                option: function (item) {
                    return _.template(optionTemplate, item);
                }
            },
            onChange: function (value) {
                //update the model via selectize.value
                $scope.$apply(function () {
                    //apply the change so that angular knows it is a change
                    // set selectize.value to null to trigger the watch and so the collaboration message
                    if ($scope.selectize.value === '' && value === '') {
                        $scope.selectize.value = null;
                    } else if ($scope.loadingStatus === loadingStatuses.loaded) {
                        $scope.selectize.value = value;
                    }
                });
            }
        };

        //given a comma separated list of ids it will go and retrieve the tags and set the results onto scope.tags and manage loading status
        $scope.loadTagsByIds = function (newVal) {
            var ids = {list: newVal, valid: isValid(newVal)};
            if (ids.valid) {
                //loading
                $scope.updateStatus(loadingStatuses.loading);

                LinkedDataService
                    .getTags({
                        ids: encodeURI(ids.list.join(','))
                    })
                    .success(function (data) {
                        $scope.updateStatus(loadingStatuses.loaded);
                        $scope.updateSelectize(data.tags);
                    })
                    .error(function () {
                        //failed
                        $scope.updateStatus(loadingStatuses.failed);
                    });
            } else {
                //no need to call linkdata service set tags to be empty
                $scope.updateStatus(loadingStatuses.loaded);
            }
        };

        function isValid (ids) {
            return ids !== undefined && angular.isArray(ids) && ids.length > 0;
        }

        $scope.updateStatus = function (status) {
            switch (status) {
                case loadingStatuses.loading:
                    $scope.loadingStatus = loadingStatuses.loading;
                    break;
                case loadingStatuses.failed:
                    $scope.loadingStatus = loadingStatuses.failed;
                    $scope.$emit(events.warning.cannot.display, {warning: true, source: 'TagController'});
                    break;

                    // duplicated. why do we need this? 
                case loadingStatuses.loaded:
                    $scope.loadingStatus = loadingStatuses.loaded;
                    $scope.$emit(events.warning.cannot.display, {warning: false, source: 'TagController'});
                    break;
                case loadingStatuses.notLoading:
                    $scope.loadingStatus = loadingStatuses.notLoading;
                    $scope.$emit(events.warning.cannot.display, {warning: false, source: 'TagController'});
                    break;
            }
        };

        //listens for $rootScope.$broadcast(events.create.clear)
        $scope.$on(events.create.update, function(){
            $scope.clearTags();
        });
    }

    function tags($timeout, loadingStatuses) {
        return {
            scope: {
                displayFilter: '=',
                preLoad: '='
            },
            restrict: 'EA',
            require: '?ngModel',
            replace: true,
            controller: 'TagController',
            //Directives that want to modify the DOM typically use the link option.
            link: function (scope, element, attr, ngModel) {
                var inputElement = $(element).find('input');

                if (scope.preLoad !== undefined && angular.isArray(scope.preLoad) && scope.preLoad.length > 0) {
                    populateSelectize(scope.preLoad);
                } else {

                    //Set ids on private scope - this will trigger the AJAX load
                    ngModel.$formatters.push(function (value) {
                        var ids = [];
                        scope.filteredIds = [];
                
                        angular.forEach(value, function (id) {
                            if (_.contains(scope.displayFilter, id)) {
                                scope.filteredIds.push(id);
                            } else {
                                ids.push(id);
                            }
                        });
                        scope.loadTagsByIds(ids);
                    });
                }

                //update to model
                ngModel.$parsers.push(function (value) {
                    if (value) {
                        value = value.split(',');
                        value = value.concat(scope.filteredIds);
                    } else {
                        value = scope.filteredIds;
                    }
                    return value;
                });

                //if the value changes update the model
                scope.$watch('selectize.value', function (newVal) {
                    ngModel.$setViewValue(newVal);
                });


                function populateSelectize(tags) {
                    $timeout(function () {
                        if (tags) {
                            angular.forEach(tags, function (tag) {
                                inputElement[0].selectize.addOption(tag);
                                inputElement[0].selectize.addItem(tag.id);
                            });
                            //loaded
                            scope.updateStatus(loadingStatuses.loaded);
                        }
                    }, 0);
                }

                scope.updateSelectize =  function (val) {
                    scope.updateStatus(loadingStatuses.notLoading);
                    scope.clearTags();
                    populateSelectize(val);
                };

                scope.clearSelectizeResults = function () {
                    var currentItems = inputElement[0].selectize.items;
                    //filter current options(array of objects) via the current items(array of ids)
                    var currentOptions = _.filter(inputElement[0].selectize.options, function (item) {
                        return _.contains(currentItems, item.id);
                    });

                    //reset selectize and then add the tags back along with the query term
                    $timeout(function () {
                        //inputElement[0].selectize.clear();
                        inputElement[0].selectize.clearOptions();
                        angular.forEach(currentOptions, function (tag) {
                            inputElement[0].selectize.addOption(tag);
                            inputElement[0].selectize.addItem(tag.id);
                        });
                        inputElement[0].selectize.open(); //would be nice if we get results open the dropdown if
                    }, 0);
                };

                scope.clearTags = function () {
                    //appears we need a $timeout around each 'element[]' block
                    //which isn't bad but evalAync() maybe better (as of 1.2)
                    //see http://www.bennadel.com/blog/2605-scope-evalasync-vs-timeout-in-angularjs.htm
                    $timeout(function () {
                        inputElement[0].selectize.$control_input.val('').keyup();
                        inputElement[0].selectize.clear();
                        inputElement[0].selectize.clearOptions();
                    }, 0);
                };

                scope.tryAgain = function () {
                    //to 'tryAgain' we need to clear selectize items and option
                    var lastQuery = inputElement[0].selectize.currentResults ? inputElement[0].selectize.currentResults.query : '';
                    //get any items (tags) in selectize
                    var currentItems = inputElement[0].selectize.items;
                    //save and re-add if we have existing tags or a query term
                    if (lastQuery.length > 0 || currentItems.length > 0) {
                        //save any options for adding back (tags) later
                        //filter current options(array of objects) via the current items(array of ids)
                        var currentOptions = _.filter(inputElement[0].selectize.options, function (item) {
                            return _.contains(currentItems, item.id);
                        });

                        //reset selectize and then add the tags back along with the query term
                        $timeout(function () {
                            inputElement[0].selectize.clear();
                            inputElement[0].selectize.clearOptions();
                            angular.forEach(currentOptions, function (tag) {
                                inputElement[0].selectize.addOption(tag);
                                inputElement[0].selectize.addItem(tag.id);
                            });
                            inputElement[0].selectize.$control_input.val('').keyup();
                            inputElement[0].selectize.$control_input.val(lastQuery).keyup();
                            inputElement[0].selectize.open(); //would be nice if we get results open the dropdown if
                        }, 0);
                    }

                    //we are attempting to load existing tags on a post
                    scope.loadTagsByIds(ngModel.$viewValue || _.difference(ngModel.$modelValue, scope.displayFilter));
                };

                inputElement.selectize(scope.selectize.options);

            },
            templateUrl: '/app/create/directives/tags/tags.html'
        };
    }

    return angular.module('vivo.create')
        .controller('TagController', ['$scope', 'events', 'LinkedDataService', 'loadingStatuses', TagController])
        .directive('tags', ['$timeout', 'loadingStatuses', tags]);
});


