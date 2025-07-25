
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("BTChat", {
    from: deployer,
    args: [], // No constructor args
    log: true,
    waitConfirmations: 1,
  });
};

module.exports.tags = ["BTChat"];