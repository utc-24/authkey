// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC1155Holder } from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import { BadgerOrganizationInterface } from "../BadgerOrganization/interfaces/BadgerOrganizationInterface.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title Badger Versions
 * @author nftchance
 * @notice This contract enables a business with an on-chain product to monetize their product
 *         at the protocol layer. Meaning a business can generate genuine revenue at the app,
 *         protocol, service, and token layer! 
 * @dev This version of Version Control is only scoped to ETH and 1155s as the broader implementation
 *      of subscription licenses has already been defined.
 */
contract BadgerVersions is 
      Ownable
    , ERC1155Holder 
{ 
    using Clones for address;

    /// @dev Denote the method of payment for a specific version.
    enum VersionPaymentType { 
          NATIVE
        , ERC1155
    }

    /// @dev Defines the operating license for a specific version.
    struct VersionLicense { 
        VersionPaymentType tokenType; 
        address tokenAddress;         
        uint256 tokenId;              
        uint256 amount;               
    }

    /// @dev Defines the general management schema for version control.
    struct Version { 
        address implementation;
        VersionLicense license;
    }

    /// @dev Announces when a new Organization is created through the protocol Factory.
    /// @dev This enables magic-appearance on the app-layer.
    event OrganizationCreated(
        address indexed organization,
        address indexed owner,
        address indexed implementation
    );

    /// @dev All of the versions that are actively running.
    ///      This also enables the ability to self-fork ones product.
    mapping(uint256 => Version) public versions;

    /// @dev Tracking the organizations that one has funded the cost for.
    mapping(uint256 => mapping(address => uint256)) public versionToFundedAmount;

    constructor(
        address _implementation
    ) {
        _setVersion(
              0
            , _implementation
            , VersionPaymentType.NATIVE
            , address(0)
            , 0
            , 0
        );
    }

    /**
     * @notice Allows Badger to control the level of access to specific versions.
     * @dev This enables the ability to have Enterprise versions as well as public versions. None of this
     *      state is immutable as a subscription model may change in the future. 
     * @param _version The version to update.
     * @param _implementation The implementation address.
     * @param _tokenType The payment type.
     * @param _tokenAddress The token address.
     * @param _tokenId The token ID.
     * @param _amount The amount that this user will have to pay.
     */
    function _setVersion(
        uint256 _version
      , address _implementation
      , VersionPaymentType _tokenType
      , address _tokenAddress
      , uint256 _tokenId
      , uint256 _amount
    ) 
        internal
    {
        versions[_version] = Version({
              implementation: _implementation
            , license: VersionLicense({
                  tokenType: _tokenType
                , tokenAddress: _tokenAddress
                , tokenId: _tokenId
                , amount: _amount
            })
        });
    }

    /**
     * See {Badger._setVersion}
     * 
     * Requirements:
     * - The caller must be the owner.
     */    
    function setVersion(
        uint256 _version
      , address _implementation
      , VersionPaymentType _tokenType
      , address _tokenAddress
      , uint256 _tokenId
      , uint256 _amount
    ) 
        external
        onlyOwner
    {
        _setVersion(
              _version
            , _implementation
            , _tokenType
            , _tokenAddress
            , _tokenId
            , _amount
        );
    }

    /**
     * @notice Creates a new Organization to be led by the deploying address.
     * @param _version The version to use for this Organization.
     * @param _deployer The address that will be the deployer of the Organizatoin contract.
     * @param _uri The base URI used for the metadata of tokens.
     * @param _organizationURI The metadata of the Organization.
     * @param _name The name of the Organization.
     * @param _symbol The symbol of the Organization.
     * @dev The Organization contract is created using the Organization implementation contract.
     */
    function _createOrganization(
          uint256 _version
        , address _deployer
        , string memory _uri
        , string memory _organizationURI
        , string memory _name
        , string memory _symbol
    )
        internal
        returns (
            address
        )
    {
        /// @dev If this version is paid deduct from the funded amount of the sender.
        if (versions[_version].license.amount > 0) {
            versionToFundedAmount[_version][msg.sender] -= versions[_version].license.amount;
        }

        /// @dev Get the address of the implementation for the desired version.
        address versionImplementation = versions[_version].implementation;

        /// @dev Get the address of the target.
        address organizationAddress = versionImplementation.clone();

        /// @dev Interface with the newly created contract to initialize it. 
        BadgerOrganizationInterface organization = BadgerOrganizationInterface(
            organizationAddress
        );

        /// @dev Deploy the clone contract to serve as the Organization.
        organization.initialize(
              _deployer
            , _uri
            , _organizationURI
            , _name
            , _symbol
        );

        emit OrganizationCreated(
              organizationAddress
            , _deployer
            , versionImplementation
        );

        return organizationAddress;
    }
}