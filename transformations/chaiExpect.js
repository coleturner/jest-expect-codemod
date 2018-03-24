const functionsToBeTransformed = ["equal", "eql", "deep", "throw"];

const getParams = (propertyName, args1, args2) => {
  switch (propertyName) {
    case "equal":
      return {
        arguments1: args1,
        identifier2: "toBe",
        arguments2: args2,
      };

    case "eql":
      return {
        arguments1: args1,
        identifier2: "toEqual",
        arguments2: args2,
      };
    case "deep":
      return {
        arguments1: args1,
        identifier2: "toEqual",
        arguments2: args2,
      };
    case "throw":
      return {
        arguments1: args1,
        identifier2: "toThrow",
        arguments2: args2,
      };
  }
};

const getTransformedSource = (source, j, fnToTransform) => {
  return j(source)
    .find(j.CallExpression, {
      callee: {
        object: {
          object: {
            callee: {
              name: "expect",
            },
          },
        },
        property: {
          name: fnToTransform,
        },
      },
    })
    .replaceWith(path => {
      const args1 = path.value.callee.object.object.arguments;
      const args2 = path.value.arguments;
      const params = getParams(fnToTransform, args1, args2);

      return j.expressionStatement(
        j.callExpression(
          j.memberExpression(
            j.callExpression(j.identifier("expect"), params.arguments1),
            j.identifier(params.identifier2),
          ),
          params.arguments2,
        ),
      );
    })
    .toSource();
};

export default function transformer(file, api) {
  const j = api.jscodeshift;

  let fileSource = file.source;
  functionsToBeTransformed.forEach(fnToTransform => {
    fileSource = getTransformedSource(fileSource, j, fnToTransform);
  });

  return fileSource;
}
